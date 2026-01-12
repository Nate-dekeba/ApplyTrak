export default function SelectFilterByStatus({onFilter}) {

    const handleFilterChange = (e) => {
        const selectedStatus = e.target.value;
        onFilter(selectedStatus);
    }

    return (
        <div className="filter-by-status">
            <label htmlFor="status-filter"></label>
            <select id="status-filter" onChange={handleFilterChange} className="status-filter-select">
                <option value="">All Statuses</option>
                <option value="Applied">Applied</option>
                <option value="Interviewing">Interviewing</option>
                <option value="Offered">Offered</option>
                <option value="Rejected">Rejected</option>
            </select>
        </div>
    )
}