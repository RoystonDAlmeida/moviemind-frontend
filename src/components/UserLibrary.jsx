import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { Card } from './ui/card';
import { Film, Trash2 } from 'lucide-react';
import { Button } from './ui/button';
import { toast } from 'sonner';

function UserLibrary({ isOpen, onClose, user }) {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen && user) {
      fetchLibrary();
    }
  }, [isOpen, user]);

  const fetchLibrary = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('user_library')
        .select('*')
        .eq('user_id', user.id)
        .order('added_at', { ascending: false });

      if (error) throw error;
      setMovies(data || []);
    } catch (error) {
      console.error('Error fetching library:', error);
      toast.error('Failed to load your library');
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (movieId) => {
    try {
      const { error } = await supabase
        .from('user_library')
        .delete()
        .eq('user_id', user.id)
        .eq('movie_id', movieId);

      if (error) throw error;

      setMovies(movies.filter(m => m.movie_id !== movieId));
      toast.success('Movie removed from library');
    } catch (error) {
      console.error('Error removing movie:', error);
      toast.error('Failed to remove movie');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[800px] bg-slate-900 text-white">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">My Movie Library</DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
          </div>
        ) : movies.length === 0 ? (
          <div className="text-center py-8 text-slate-400">
            <Film className="mx-auto h-12 w-12 mb-4" />
            <p>Your library is empty. Start adding movies you love!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            {movies.map((movie) => (
              <Card key={movie.movie_id} className="bg-slate-800 border-slate-700 overflow-hidden">
                <div className="flex">
                  <div className="w-24 h-36 bg-slate-900 flex-shrink-0">
                    {movie.poster ? (
                      <img
                        src={movie.poster}
                        alt={movie.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Film className="h-8 w-8 text-slate-700" />
                      </div>
                    )}
                  </div>
                  <div className="p-4 flex-1">
                    <div className="flex justify-between items-start">
                      <h3 className="font-semibold truncate">{movie.title}</h3>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemove(movie.movie_id)}
                        className="text-slate-400 hover:text-red-400"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <p className="text-sm text-slate-400 mt-1">{movie.year}</p>
                    <div className="mt-2 flex flex-wrap gap-1">
                      {movie.genres?.map((genre) => (
                        <span
                          key={genre}
                          className="px-2 py-0.5 rounded-full bg-slate-700 text-slate-300 text-xs"
                        >
                          {genre}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

export default UserLibrary;