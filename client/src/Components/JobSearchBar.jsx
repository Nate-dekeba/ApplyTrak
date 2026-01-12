export default function JobSearchBar({onSearch}) {

    const handleSearch = (e) => {
        const query = e.target.value;
        onSearch(query);
    }

    return (
        <div className="job-search-bar">
            <input
                type="text"
                placeholder="Search jobs by title, company, or location..."
                onChange={handleSearch}
                className="search-input"
            />
        </div>
    )
}