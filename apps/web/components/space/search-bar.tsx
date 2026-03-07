import { Plus, Search } from "lucide-react";
import { Input } from "../ui/input";
import Image from "next/image";
import { Button } from "../ui/button";
import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { useAddSong, useYoutubeSearch } from "@/hooks/use-song";
import { useParams } from "next/navigation";

export function SearchBar() {
  const { id: spaceId } = useParams<{ id: string }>();
  const { mutate: addSong } = useAddSong();

  const [searchQuery, setSearchQuery] = useState("");
  const [showResults, setShowResults] = useState(false);
  const [debouncedQuery, setDebouncedQuery] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(searchQuery), 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const { data: searchResults, isLoading: isSearching } =
    useYoutubeSearch(debouncedQuery);

  const handleAddFromSearch = (result: any) => {
    addSong({
      spaceId,
      youtubeId: result.id,
      title: result.title,
      thumbnail: result.thumbnail,
      duration: result.duration,
    });
    setSearchQuery("");
    setShowResults(false);
  };

  return (
    <div>
      {/* Search Bar Section */}
      <div className="px-4 py-4 border-b border-white/10 space-y-4">
        <div className="relative group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-white transition-colors" />
          <Input
            placeholder="Search songs on YouTube..."
            className="pl-10 pr-10 py-5 bg-white/5 border-white/10 focus:bg-white/10 rounded-xl text-sm"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setShowResults(true);
            }}
            onFocus={() => setShowResults(true)}
          />
          {searchQuery && (
            <button
              onClick={() => {
                setSearchQuery("");
                setShowResults(false);
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-white/10 rounded-full transition-colors"
            >
              <X className="h-4 w-4 text-slate-400" />
            </button>
          )}

          {/* Search Results Dropdown */}
          {showResults && searchQuery && (
            <div className="absolute top-full left-0 right-0 z-50 mt-2 bg-[#0a0a0a] border border-white/10 rounded-xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden max-h-[480px] flex flex-col">
              <div className="sticky top-0 bg-[#0a0a0a] px-4 py-3 border-b border-white/5 flex items-center justify-between z-10">
                <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                  Search Results
                </h4>
                <button
                  onClick={() => setShowResults(false)}
                  className="text-[10px] text-slate-500 hover:text-white transition-colors"
                >
                  Close
                </button>
              </div>

              <div className="overflow-y-auto px-2 pb-2 custom-scrollbar">
                {isSearching ? (
                  <div className="flex flex-col gap-1 p-2">
                    {[...Array(5)].map((_, i) => (
                      <div
                        key={i}
                        className="flex gap-4 items-center animate-pulse p-2"
                      >
                        <div className="w-12 h-9 bg-white/5 rounded" />
                        <div className="flex-1 space-y-2">
                          <div className="h-2 bg-white/5 rounded w-3/4" />
                          <div className="h-2 bg-white/5 rounded w-1/2" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : searchResults && searchResults.length > 0 ? (
                  <div className="py-1">
                    {searchResults.map((result) => (
                      <div
                        key={result.id}
                        className="group flex items-center gap-3 p-2 hover:bg-white/5 rounded-lg transition-colors cursor-pointer"
                        onClick={() => handleAddFromSearch(result)}
                      >
                        <div className="relative shrink-0">
                          <Image
                            src={result.thumbnail || "/placeholder.svg"}
                            alt={result.title}
                            width={48}
                            height={36}
                            className="w-12 h-9 object-cover rounded shadow-sm"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-xs truncate">
                            {result.title}
                          </h4>
                          <p className="text-[10px] text-slate-500 truncate mt-0.5">
                            {result.channelTitle}
                          </p>
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 w-7 p-0 text-slate-500 hover:text-white hover:bg-white/10"
                        >
                          <Plus className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-slate-500 text-xs">
                    No results found for "{searchQuery}"
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
