'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Plus, Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, Eye, EyeOff, 
  Trash, Shuffle, Repeat, Heart, Clock
} from 'lucide-react';

interface MusicPanelProps {
  youtubeUrl: string;
  setYoutubeUrl: React.Dispatch<React.SetStateAction<string>>;
  trackInfo: string;
  handleAddTrack: () => void;
  showMessage: (msg: string) => void;
  accentColor: string;
  IconButton: React.FC<{ children: React.ReactNode; onClick: () => void; className?: string }>;
}

interface Track {
  url: string;
  id: string;
  title: string;
  loading?: boolean;
  duration?: string;
  liked?: boolean;
}

const isValidYouTubeUrl = (url: string): boolean => {
  const pattern = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/(watch\?v=|embed\/|v\/)?([a-zA-Z0-9_-]{11})/;
  return pattern.test(url);
};

const extractVideoId = (url: string): string | null => {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/v\/)([a-zA-Z0-9_-]{11})/,
    /^([a-zA-Z0-9_-]{11})$/
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
};

const fetchVideoTitle = async (videoId: string): Promise<string> => {
  try {
    const response = await fetch(`https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`);
    if (response.ok) {
      const data = await response.json();
      return data.title || `YouTube Video: ${videoId}`;
    }
  } catch (error) {
    console.error('Error fetching video title:', error);
  }
  return `YouTube Video: ${videoId}`;
};

const MusicPanel: React.FC<MusicPanelProps> = ({ 
  youtubeUrl, 
  setYoutubeUrl, 
  trackInfo, 
  handleAddTrack: originalHandleAddTrack, 
  showMessage, 
  accentColor, 
  IconButton 
}) => {
  const [playlist, setPlaylist] = useState<Track[]>([]);
  const [currentTrack, setCurrentTrack] = useState<number | null>(null);
  const [error, setError] = useState('');
  const [showVideo, setShowVideo] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playerReady, setPlayerReady] = useState(false);
  const [volume, setVolume] = useState(70);
  const [isMuted, setIsMuted] = useState(false);
  const [isShuffled, setIsShuffled] = useState(false);
  const [repeatMode, setRepeatMode] = useState<'off' | 'all' | 'one'>('off');
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [isAddingTrack, setIsAddingTrack] = useState(false);
  
  const playerRef = useRef<any>(null);
  const playerContainerRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const volumeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Enhanced tab volume control that actually works
  const applyTabVolume = useCallback(() => {
    const actualVolume = isMuted ? 0 : volume / 100;
    
    // Clear any existing timeout
    if (volumeTimeoutRef.current) {
      clearTimeout(volumeTimeoutRef.current);
    }
    
    // Apply volume with retry mechanism
    const applyVolumeToElements = () => {
      // Get all video and audio elements
      const mediaElements = [
        ...document.querySelectorAll('video'),
        ...document.querySelectorAll('audio'),
        ...document.querySelectorAll('iframe[src*="youtube"]')
      ];
      
      mediaElements.forEach((element: any) => {
        if (element.tagName === 'IFRAME') {
          // For YouTube iframes, we'll use postMessage
          try {
            element.contentWindow?.postMessage(
              `{"event":"command","func":"setVolume","args":[${actualVolume * 100}]}`,
              '*'
            );
          } catch (e) {
            // Fallback: try to find video elements inside iframe
            const videos = element.contentDocument?.querySelectorAll('video') || [];
            videos.forEach((video: any) => {
              if (video && typeof video.volume !== 'undefined') {
                video.volume = actualVolume;
              }
            });
          }
        } else if (element && typeof element.volume !== 'undefined') {
          element.volume = actualVolume;
          element.muted = isMuted;
        }
      });
    };

    // Apply immediately
    applyVolumeToElements();
    
    // Also apply after a short delay to catch dynamically created elements
    volumeTimeoutRef.current = setTimeout(applyVolumeToElements, 100);
    
    // Also use YouTube API if available
    if (playerRef.current && typeof playerRef.current.setVolume === 'function') {
      try {
        if (isMuted) {
          playerRef.current.mute();
        } else {
          playerRef.current.unMute();
          playerRef.current.setVolume(volume);
        }
      } catch (e) {
        console.log('YouTube API volume control not available');
      }
    }
  }, [volume, isMuted]);

  // Apply volume changes
  useEffect(() => {
    applyTabVolume();
  }, [applyTabVolume]);

  // Progress tracking with better error handling
  useEffect(() => {
    const interval = setInterval(() => {
      if (playerRef.current && isPlaying && !isAddingTrack) {
        try {
          const current = playerRef.current.getCurrentTime();
          const total = playerRef.current.getDuration();
          
          if (!isNaN(current) && !isNaN(total) && total > 0) {
            setCurrentTime(current);
            setDuration(total);
            setProgress((current / total) * 100);
          }
        } catch (e) {
          // Handle errors silently
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isPlaying, isAddingTrack]);

  // Load YouTube API
  useEffect(() => {
    if (!(window as any).YT) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag?.parentNode?.insertBefore(tag, firstScriptTag);

      (window as any).onYouTubeIframeAPIReady = () => {
        setPlayerReady(true);
      };
    } else {
      setPlayerReady(true);
    }

    return () => {
      if (volumeTimeoutRef.current) {
        clearTimeout(volumeTimeoutRef.current);
      }
    };
  }, []);

  // Initialize player - FIXED: Only when track changes, not when playlist changes
  useEffect(() => {
    if (playerReady && currentTrack !== null && playlist[currentTrack] && playerContainerRef.current && !isAddingTrack) {
      // Only destroy and recreate if we're switching to a different video
      const currentVideoId = playerRef.current?.getVideoData?.()?.video_id;
      const newVideoId = playlist[currentTrack].id;
      
      if (currentVideoId !== newVideoId) {
        if (playerRef.current) {
          playerRef.current.destroy();
        }

        playerRef.current = new (window as any).YT.Player(playerContainerRef.current, {
          height: '100%',
          width: '100%',
          videoId: newVideoId,
          playerVars: {
            autoplay: 1,
            controls: 0,
            modestbranding: 1,
            rel: 0,
            showinfo: 0,
            iv_load_policy: 3
          },
          events: {
            onReady: (event: any) => {
              setIsPlaying(true);
              applyTabVolume();
              // Set video visibility
              if (!showVideo) {
                event.target.getIframe().style.opacity = '0';
              }
            },
            onStateChange: (event: any) => {
              const YT = (window as any).YT;
              if (event.data === YT.PlayerState.ENDED) {
                handleNext();
              }
              setIsPlaying(event.data === YT.PlayerState.PLAYING);
            }
          }
        });
      }
    }
  }, [playerReady, currentTrack, playlist.length, isAddingTrack]); // Removed playlist dependency

  // Handle video visibility - FIXED
  useEffect(() => {
    if (playerRef.current && playerRef.current.getIframe) {
      const iframe = playerRef.current.getIframe();
      if (iframe) {
        if (showVideo) {
          iframe.style.opacity = '1';
          iframe.style.pointerEvents = 'auto';
        } else {
          iframe.style.opacity = '0';
          iframe.style.pointerEvents = 'none';
        }
      }
    }
  }, [showVideo]);

  const handleAddTrack = async () => {
    if (isAddingTrack) return; // Prevent multiple simultaneous additions
    
    if (!isValidYouTubeUrl(youtubeUrl)) {
      setError('Please enter a valid YouTube URL.');
      showMessage('Please enter a valid YouTube URL.');
      return;
    }

    const id = extractVideoId(youtubeUrl);
    if (!id) {
      setError('Could not extract video ID.');
      showMessage('Could not extract video ID.');
      return;
    }

    if (playlist.some((track) => track.id === id)) {
      setError('This video is already in the playlist.');
      showMessage('This video is already in the playlist.');
      return;
    }

    setIsAddingTrack(true);
    
    const newTrack: Track = {
      url: youtubeUrl,
      id,
      title: 'Loading...',
      loading: true
    };

    const newPlaylistLength = playlist.length;
    setPlaylist(prev => [...prev, newTrack]);
    setError('');

    // Only set as current track if no track is currently playing
    if (currentTrack === null) {
      setCurrentTrack(newPlaylistLength);
    }

    showMessage('Track added to playlist!');

    try {
      const title = await fetchVideoTitle(id);
      setPlaylist(prev => 
        prev.map(track => 
          track.id === id 
            ? { ...track, title, loading: false }
            : track
        )
      );
    } catch (error) {
      setPlaylist(prev => 
        prev.map(track => 
          track.id === id 
            ? { ...track, title: `YouTube Video: ${id}`, loading: false }
            : track
        )
      );
    } finally {
      setIsAddingTrack(false);
    }

    setYoutubeUrl('');
  };

  const handleRemoveTrack = (index: number) => {
    const updated = playlist.filter((_, i) => i !== index);
    setPlaylist(updated);

    if (currentTrack === index) {
      if (updated.length > 0) {
        const newIndex = index >= updated.length ? 0 : index;
        setCurrentTrack(newIndex);
      } else {
        setCurrentTrack(null);
        setIsPlaying(false);
        if (playerRef.current) {
          playerRef.current.destroy();
          playerRef.current = null;
        }
      }
    } else if (currentTrack !== null && index < currentTrack) {
      setCurrentTrack(currentTrack - 1);
    }

    showMessage('Track removed from playlist.');
  };

  const loadTrack = (index: number) => {
    if (playlist[index] && index !== currentTrack) {
      setCurrentTrack(index);
    }
  };

  const handlePrev = () => {
    if (currentTrack !== null && currentTrack > 0) {
      loadTrack(currentTrack - 1);
    } else if (playlist.length > 0) {
      loadTrack(playlist.length - 1);
    }
  };

  const handleNext = () => {
    if (repeatMode === 'one' && currentTrack !== null) {
      if (playerRef.current) {
        playerRef.current.seekTo(0);
        playerRef.current.playVideo();
      }
      return;
    }

    if (currentTrack !== null && currentTrack < playlist.length - 1) {
      loadTrack(currentTrack + 1);
    } else if (playlist.length > 0 && repeatMode === 'all') {
      loadTrack(0);
    }
  };

  const togglePlayPause = () => {
    if (playerRef.current) {
      if (isPlaying) {
        playerRef.current.pauseVideo();
      } else {
        playerRef.current.playVideo();
      }
    }
  };

  const toggleVideo = () => {
    setShowVideo(prev => {
      const newValue = !prev;
      showMessage(newValue ? 'Video shown' : 'Video hidden - audio only');
      return newValue;
    });
  };

  const toggleMute = () => {
    setIsMuted(prev => {
      const newMuted = !prev;
      showMessage(newMuted ? 'Muted' : 'Unmuted');
      return newMuted;
    });
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseInt(e.target.value);
    setVolume(newVolume);
    if (newVolume === 0 && !isMuted) {
      setIsMuted(true);
    } else if (newVolume > 0 && isMuted) {
      setIsMuted(false);
    }
  };

  const toggleRepeat = () => {
    const modes: Array<'off' | 'all' | 'one'> = ['off', 'all', 'one'];
    const current = modes.indexOf(repeatMode);
    const next = modes[(current + 1) % modes.length];
    setRepeatMode(next);
    showMessage(
      next === 'off' ? 'Repeat off' :
      next === 'all' ? 'Repeat all' : 'Repeat one'
    );
  };

  const toggleShuffle = () => {
    setIsShuffled(prev => {
      const newValue = !prev;
      showMessage(newValue ? 'Shuffle on' : 'Shuffle off');
      return newValue;
    });
  };

  const toggleLike = (index: number) => {
    setPlaylist(prev => 
      prev.map((track, i) => 
        i === index ? { ...track, liked: !track.liked } : track
      )
    );
    const track = playlist[index];
    if (track) {
      showMessage(track.liked ? 'Removed from favorites' : 'Added to favorites');
    }
  };

  const formatTime = (seconds: number) => {
    if (isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (progressRef.current && playerRef.current && duration) {
      const rect = progressRef.current.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const percentage = clickX / rect.width;
      const newTime = percentage * duration;
      playerRef.current.seekTo(newTime);
    }
  };

  return (
    <>
      <style jsx>{`
        .custom-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: rgba(107, 114, 128, 0.6) transparent;
        }
        
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(55, 65, 81, 0.3);
          border-radius: 3px;
          margin: 4px 0;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(107, 114, 128, 0.6);
          border-radius: 3px;
          transition: background 0.2s ease;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(156, 163, 175, 0.8);
        }
        
        .custom-scrollbar::-webkit-scrollbar-corner {
          background: transparent;
        }
        
        /* Dynamic accent color for scrollbar */
        .custom-scrollbar.text-green-400::-webkit-scrollbar-thumb {
          background: rgba(74, 222, 128, 0.4);
        }
        .custom-scrollbar.text-green-400::-webkit-scrollbar-thumb:hover {
          background: rgba(74, 222, 128, 0.6);
        }
        
        .custom-scrollbar.text-blue-400::-webkit-scrollbar-thumb {
          background: rgba(96, 165, 250, 0.4);
        }
        .custom-scrollbar.text-blue-400::-webkit-scrollbar-thumb:hover {
          background: rgba(96, 165, 250, 0.6);
        }
        
        .custom-scrollbar.text-purple-400::-webkit-scrollbar-thumb {
          background: rgba(196, 181, 253, 0.4);
        }
        .custom-scrollbar.text-purple-400::-webkit-scrollbar-thumb:hover {
          background: rgba(196, 181, 253, 0.6);
        }
        
        .custom-scrollbar.text-pink-400::-webkit-scrollbar-thumb {
          background: rgba(244, 114, 182, 0.4);
        }
        .custom-scrollbar.text-pink-400::-webkit-scrollbar-thumb:hover {
          background: rgba(244, 114, 182, 0.6);
        }
        
        .custom-scrollbar.text-red-400::-webkit-scrollbar-thumb {
          background: rgba(248, 113, 113, 0.4);
        }
        .custom-scrollbar.text-red-400::-webkit-scrollbar-thumb:hover {
          background: rgba(248, 113, 113, 0.6);
        }
        
        .custom-scrollbar.text-yellow-400::-webkit-scrollbar-thumb {
          background: rgba(251, 191, 36, 0.4);
        }
        .custom-scrollbar.text-yellow-400::-webkit-scrollbar-thumb:hover {
          background: rgba(251, 191, 36, 0.6);
        }
        
        .custom-scrollbar.text-orange-400::-webkit-scrollbar-thumb {
          background: rgba(251, 146, 60, 0.4);
        }
        .custom-scrollbar.text-orange-400::-webkit-scrollbar-thumb:hover {
          background: rgba(251, 146, 60, 0.6);
        }
        
        .custom-scrollbar.text-cyan-400::-webkit-scrollbar-thumb {
          background: rgba(34, 211, 238, 0.4);
        }
        .custom-scrollbar.text-cyan-400::-webkit-scrollbar-thumb:hover {
          background: rgba(34, 211, 238, 0.6);
        }
        
        .custom-scrollbar.text-indigo-400::-webkit-scrollbar-thumb {
          background: rgba(129, 140, 248, 0.4);
        }
        .custom-scrollbar.text-indigo-400::-webkit-scrollbar-thumb:hover {
          background: rgba(129, 140, 248, 0.6);
        }
        
        .custom-scrollbar.text-emerald-400::-webkit-scrollbar-thumb {
          background: rgba(52, 211, 153, 0.4);
        }
        .custom-scrollbar.text-emerald-400::-webkit-scrollbar-thumb:hover {
          background: rgba(52, 211, 153, 0.6);
        }
      `}</style>
    <div className="p-4 sm:p-6 border-2 rounded-xl border-gray-700 flex flex-col justify-between min-h-[400px]">
      {/* Add Track */}
      <div className="flex items-center space-x-2 mb-3">
        <input
          type="text"
          placeholder="Paste YouTube URL..."
          value={youtubeUrl}
          onChange={(e) => setYoutubeUrl(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAddTrack()}
          disabled={isAddingTrack}
          className="flex-grow bg-transparent border-b-2 border-gray-600 focus:outline-none focus:border-current py-1 px-2 text-sm sm:text-base disabled:opacity-50"
        />
        <IconButton onClick={handleAddTrack} className={`p-1 ${isAddingTrack ? 'opacity-50 cursor-not-allowed' : ''}`}>
          <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
        </IconButton>
      </div>

      {error && <p className="text-red-500 text-xs sm:text-sm mb-2">{error}</p>}

      {/* Current Track Info */}
      {currentTrack !== null && playlist[currentTrack] && (
        <div className="mb-3 p-3 border border-gray-700 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs text-gray-500 font-mono">NOW PLAYING</p>
            <div className="flex items-center space-x-1">
              <button
                onClick={() => toggleLike(currentTrack!)}
                className={`p-1 rounded border-2 border-current transition-colors duration-200 ${
                  playlist[currentTrack].liked ? `${accentColor} hover:bg-gray-800` : 'text-gray-600 hover:text-red-400'
                }`}
              >
                <Heart className={`w-3 h-3 ${playlist[currentTrack].liked ? 'fill-current' : ''}`} />
              </button>
            </div>
          </div>
          
          <p className={`text-sm font-medium ${accentColor} break-words whitespace-normal mb-2`}>
            {playlist[currentTrack].loading ? 'Loading...' : playlist[currentTrack].title}
          </p>
          
          {/* Progress Bar */}
          <div className="space-y-1">
            <div 
              ref={progressRef}
              className="h-1 bg-gray-700 rounded-full cursor-pointer"
              onClick={handleProgressClick}
            >
              <div 
                className={`h-full ${accentColor.replace('text-', 'bg-')} rounded-full transition-all duration-200`}
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="flex justify-between items-center text-xs text-gray-500">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>
        </div>
      )}

      {/* Playlist */}
      <div className="flex-1 mb-4">
        <div className="text-xs text-gray-500 mb-2 font-mono">PLAYLIST ({playlist.length})</div>
        <div className={`space-y-1 text-sm text-gray-300 max-h-32 overflow-y-auto custom-scrollbar ${accentColor}`}>
          {playlist.length === 0 ? (
            <p className="text-gray-500 italic text-center py-4">No tracks added.</p>
          ) : (
            playlist.map((track, index) => (
              <div
                key={track.id}
                className={`flex items-center justify-between px-2 py-1 rounded border transition-all duration-200 ${
                  index === currentTrack 
                    ? `border-current ${accentColor} bg-gray-900` 
                    : 'border-transparent hover:border-gray-600 hover:bg-gray-900'
                }`}
              >
                <button
                  className="flex-grow text-left overflow-hidden"
                  onClick={() => loadTrack(index)}
                >
                  <div
                    className="truncate block w-full max-w-full font-medium text-xs"
                    title={track.title}
                  >
                    {track.loading ? 'Loading...' : track.title}
                  </div>
                  <div className="text-xs text-gray-600 truncate w-full max-w-full" title={track.id}>
                    {track.id}
                  </div>
                </button>

                <div className="flex items-center space-x-1 ml-2">
                  {track.liked && <Heart className="w-3 h-3 text-red-400 fill-current" />}
                  <button
                    onClick={() => handleRemoveTrack(index)}
                    className="text-gray-600 hover:text-red-400 text-xs"
                  >
                    [x]
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Video Player */}
      {currentTrack !== null && playlist[currentTrack] && (
        <div className="mb-4">
          <div 
            className="w-full rounded-md border border-gray-700 bg-black overflow-hidden relative"
            style={{ aspectRatio: '16/9' }}
          >
            <div ref={playerContainerRef} className="w-full h-full"></div>
            {!showVideo && (
              <div className="absolute inset-0 bg-gray-900 flex items-center justify-center">
                <div className="text-center">
                  <div className={`text-2xl ${accentColor} mb-2 font-mono animate-pulse`}>♪</div>
                  <p className={`text-sm ${accentColor} font-mono`}>AUDIO ONLY</p>
                  <p className="text-xs text-gray-500">Video hidden</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Controls */}
      <div className="space-y-3">
        {/* Main Controls */}
        <div className="flex justify-center items-center space-x-3">
          <button
            onClick={toggleShuffle}
            className={`p-1 rounded-full border-2 border-current transition-colors duration-200 ${
              isShuffled ? `${accentColor} bg-gray-800` : 'text-gray-600 hover:text-white hover:bg-gray-800'
            }`}
          >
            <Shuffle className="w-4 h-4" />
          </button>
          
          <IconButton onClick={handlePrev} className="p-1">
            <SkipBack className="w-5 h-5" />
          </IconButton>
          
          <IconButton onClick={togglePlayPause} className="p-2">
            {isPlaying ? (
              <Pause className="w-6 h-6" />
            ) : (
              <Play className="w-6 h-6" />
            )}
          </IconButton>
          
          <IconButton onClick={handleNext} className="p-1">
            <SkipForward className="w-5 h-5" />
          </IconButton>
          
          <button
            onClick={toggleRepeat}
            className={`p-1 rounded-full border-2 border-current transition-colors duration-200 relative ${
              repeatMode !== 'off' ? `${accentColor} bg-gray-800` : 'text-gray-600 hover:text-white hover:bg-gray-800'
            }`}
          >
            <Repeat className="w-4 h-4" />
            {repeatMode === 'one' && (
              <span className={`absolute -top-1 -right-1 w-3 h-3 ${accentColor.replace('text-', 'bg-')} rounded-full text-xs flex items-center justify-center text-black font-bold`}>
                1
              </span>
            )}
            {repeatMode === 'all' && (
              <span className={`absolute -top-1 -right-1 w-2 h-2 ${accentColor.replace('text-', 'bg-')} rounded-full`} />
            )}
          </button>
        </div>

        {/* Secondary Controls */}
        <div className="flex justify-center items-center space-x-3">
          <div className="relative">
            <button
              onClick={() => setShowVolumeSlider(!showVolumeSlider)}
              className={`p-1 rounded-full border-2 border-current transition-colors duration-200 ${
                showVolumeSlider ? `${accentColor} bg-gray-800` : 'text-gray-600 hover:text-white hover:bg-gray-800'
              }`}
            >
              {isMuted || volume === 0 ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>
            
            {showVolumeSlider && (
              <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-gray-900 border border-gray-600 rounded-lg p-3 shadow-lg">
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={isMuted ? 0 : volume}
                  onChange={handleVolumeChange}
                  className={`w-20 accent-current ${accentColor}`}
                />
                <div className={`text-xs text-center mt-1 ${accentColor} font-mono`}>
                  {isMuted ? 0 : volume}%
                </div>
                <button
                  onClick={toggleMute}
                  className={`w-full mt-2 text-xs ${accentColor} hover:bg-gray-800 py-1 px-2 rounded`}
                >
                  {isMuted ? 'Unmute' : 'Mute'}
                </button>
              </div>
            )}
          </div>
          
          <button
            onClick={toggleVideo}
            className={`p-1 rounded-full border-2 border-current transition-colors duration-200 ${
              !showVideo ? `${accentColor} bg-gray-800` : 'text-gray-600 hover:text-white hover:bg-gray-800'
            }`}
          >
            {showVideo ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </div>
    </>
  );
};

export default MusicPanel;