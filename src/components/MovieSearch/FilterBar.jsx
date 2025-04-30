import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
  } from '../ui/select';
  
  function FilterBar({
    selectedLanguage,
    setSelectedLanguage,
    selectedType,
    setSelectedType,
    selectedGenre,
    setSelectedGenre,
    availableLanguages,
    availableTypes,
    availableGenres,
  }) {
    return (
      <div className="flex flex-col md:flex-row justify-center items-center w-full px-4 md:px-0">
        <div className="flex flex-col space-y-2 md:flex-row md:space-y-0 md:space-x-4 w-full md:w-auto items-center">
          <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
            <SelectTrigger className="w-48 bg-slate-800 border-slate-700">
              <SelectValue placeholder="Language" />
            </SelectTrigger>
            <SelectContent>
              {availableLanguages.map((lang) => (
                <SelectItem key={lang} value={lang}>
                  {lang === 'all' ? 'All Languages' : lang.charAt(0).toUpperCase() + lang.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
  
          <Select value={selectedType} onValueChange={setSelectedType}>
            <SelectTrigger className="w-48 bg-slate-800 border-slate-700">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              {availableTypes.map((t) => (
                <SelectItem key={t} value={t}>
                  {t === 'all' ? 'All Types' : t.charAt(0).toUpperCase() + t.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
  
          <Select value={selectedGenre} onValueChange={setSelectedGenre}>
            <SelectTrigger className="w-48 bg-slate-800 border-slate-700">
              <SelectValue placeholder="Genre" />
            </SelectTrigger>
            <SelectContent>
              {availableGenres.map((g) => (
                <SelectItem key={g} value={g}>
                  {g === 'all' ? 'All Genres' : g.charAt(0).toUpperCase() + g.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    );
  }
  
export default FilterBar;  