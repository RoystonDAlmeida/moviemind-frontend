function ResultsCount({ numResults }) {
    return (
      <div className="text-slate-300 whitespace-nowrap">
        {numResults} {numResults === 1 ? 'result' : 'results'} found
      </div>
    );
}
  
export default ResultsCount;  