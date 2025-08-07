'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Plus, Play, Pause, SkipBack, SkipForward, Volume1, Eye, EyeOff, Trash
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
  
  const playerRef = useRef<any>(null);
  const playerContainerRef = useRef<HTMLDivElement>(null);

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
  }, []);

  // Initialize player when ready and track available
  useEffect(() => {
    if (playerReady && currentTrack !== null && playlist[currentTrack] && playerContainerRef.current) {
      if (playerRef.current) {
        playerRef.current.destroy();
      }

      playerRef.current = new (window as any).YT.Player(playerContainerRef.current, {
        height: '100%',
        width: '100%',
        videoId: playlist[currentTrack].id,
        playerVars: {
          autoplay: 1,
          controls: 0,
          modestbranding: 1,
          rel: 0,
          showinfo: 0
        },
        events: {
          onReady: (event: any) => {
            setIsPlaying(true);
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
  }, [playerReady, currentTrack, playlist]);

  const handleAddTrack = async () => {
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

    // Add track with loading state
    const newTrack: Track = {
      url: youtubeUrl,
      id,
      title: 'Loading...',
      loading: true
    };

    setPlaylist(prev => [...prev, newTrack]);
    setError('');

    // If this is the first track, set it as current
    if (currentTrack === null) {
      setCurrentTrack(playlist.length);
    }

    showMessage('Track added to playlist!');

    // Fetch the title
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
    }

    // Clear the URL input
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
    if (playlist[index]) {
      setCurrentTrack(index);
      if (playerRef.current) {
        playerRef.current.loadVideoById(playlist[index].id);
      }
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
    if (currentTrack !== null && currentTrack < playlist.length - 1) {
      loadTrack(currentTrack + 1);
    } else if (playlist.length > 0) {
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
    setShowVideo(prev => !prev);
    showMessage(showVideo ? 'Video hidden - audio only' : 'Video shown');
  };

  const handleTrackSelect = (index: number) => {
    loadTrack(index);
  };

  return (
    <div className="p-4 sm:p-6 border-2 rounded-xl border-gray-700 flex flex-col justify-between min-h-[300px]">
      {/* Add Track */}
      <div className="flex items-center space-x-2 mb-3">
        <input
          type="text"
          placeholder="Paste YouTube URL..."
          value={youtubeUrl}
          onChange={(e) => setYoutubeUrl(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAddTrack()}
          className="flex-grow bg-transparent border-b-2 border-gray-600 focus:outline-none focus:border-current py-1 px-2 text-sm sm:text-base"
        />
        <IconButton onClick={handleAddTrack} className="p-1">
          <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
        </IconButton>
      </div>

      {error && <p className="text-red-500 text-xs sm:text-sm mb-2">{error}</p>}

      {/* Playlist */}
      <div className="space-y-1 text-sm text-gray-300 max-h-40 overflow-y-auto mb-4 ">
        {playlist.length === 0 ? (
          <p className="text-gray-500 italic">No tracks added.</p>
        ) : (
          playlist.map((track, index) => (
            <div
              key={track.id}
              className={`flex items-center justify-between px-2 py-1 rounded cursor-pointer ${
                index === currentTrack 
                  ? `bg-gray-800 ${accentColor}` 
                  : 'hover:bg-gray-800'
              }`}
            >
              <button
  className="flex-grow text-left overflow-hidden"
  onClick={() => handleTrackSelect(index)}
>
  <div
    className="truncate block w-full max-w-full font-medium"
    title={track.title}
  >
    {track.loading ? 'Loading...' : track.title}
  </div>

  <div className="text-xs text-gray-500 truncate w-full max-w-full" title={track.id}>
    {track.id}
  </div>
</button>

              <button
                onClick={() => handleRemoveTrack(index)}
                className={`text-gray-600 hover:${accentColor.replace('text-', 'text-')} ml-2`}
              >
                <Trash className="w-4 h-4" />
              </button>
            </div>
          ))
        )}
      </div>

      {/* Video Player */}
      {currentTrack !== null && playlist[currentTrack] && (
        <div className="mb-4">
          {showVideo ? (
            <div 
              className="w-full rounded-md border border-gray-700 bg-black overflow-hidden"
              style={{ aspectRatio: '16/9' }}
            >
              <div ref={playerContainerRef} className="w-full h-full"></div>
            </div>
          ) : (
            <div 
              className="w-full rounded-md border border-gray-700 bg-gray-800 flex items-center justify-center"
              style={{ aspectRatio: '16/9' }}
            >
              <div className="text-center">
                <div className={`text-2xl ${accentColor} mb-2`}>♪</div>
                <p className={`text-sm ${accentColor}`}>Audio Only Mode</p>
                <p className="text-xs text-gray-500">Video hidden, audio playing</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Controls */}
      <div className="flex justify-center space-x-3 mt-2">
        <IconButton onClick={handlePrev}>
          <SkipBack className="w-5 h-5 sm:w-6 sm:h-6" />
        </IconButton>
        <IconButton onClick={togglePlayPause}>
          {isPlaying ? (
            <Pause className="w-5 h-5 sm:w-6 sm:h-6" />
          ) : (
            <Play className="w-5 h-5 sm:w-6 sm:h-6" />
          )}
        </IconButton>
        <IconButton onClick={handleNext}>
          <SkipForward className="w-5 h-5 sm:w-6 sm:h-6" />
        </IconButton>
        <IconButton onClick={() => showMessage('Volume control requires YouTube Premium API access')}>
          <Volume1 className="w-5 h-5 sm:w-6 sm:h-6" />
        </IconButton>
        <IconButton onClick={toggleVideo}>
          {showVideo ? (
            <EyeOff className="w-5 h-5 sm:w-6 sm:h-6" />
          ) : (
            <Eye className="w-5 h-5 sm:w-6 sm:h-6" />
          )}
        </IconButton>
      </div>

      {/* Current Track Info */}
      {currentTrack !== null && playlist[currentTrack] && (
        <div className="mt-3 text-center">
          <p className="text-xs text-gray-500">Now Playing</p>
            <p className={`text-sm font-medium ${accentColor} break-words whitespace-normal`}>
            {playlist[currentTrack].loading ? 'Loading...' : playlist[currentTrack].title}
            </p>
        </div>
      )}
    </div>
  );
};

export default MusicPanel;