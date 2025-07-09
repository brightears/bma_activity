import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

const Reports = () => {
  const { user } = useAuth();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    startWeek: '',
    endWeek: '',
    teamMember: '',
    search: ''
  });
  const [expandedReport, setExpandedReport] = useState(null);

  useEffect(() => {
    fetchReports();
  }, [filters]);

  const fetchReports = async () => {
    try {
      const params = new URLSearchParams();
      Object.keys(filters).forEach(key => {
        if (filters[key]) params.append(key, filters[key]);
      });
      
      const response = await axios.get(`/api/reports?${params}`);
      setReports(response.data);
    } catch (error) {
      console.error('Error fetching reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  const toggleReport = (reportId) => {
    setExpandedReport(expandedReport === reportId ? null : reportId);
  };

  const exportToCSV = async () => {
    try {
      const response = await axios.get('/api/reports/export', {
        responseType: 'blob',
        params: filters
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `reports_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Error exporting reports:', error);
      alert('Failed to export reports');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-bma-red"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Filters</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Start Week
            </label>
            <input
              type="number"
              placeholder="Week number"
              value={filters.startWeek}
              onChange={(e) => handleFilterChange('startWeek', e.target.value)}
              className="input-field"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              End Week
            </label>
            <input
              type="number"
              placeholder="Week number"
              value={filters.endWeek}
              onChange={(e) => handleFilterChange('endWeek', e.target.value)}
              className="input-field"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Team Member
            </label>
            <input
              type="text"
              placeholder="Name or email"
              value={filters.teamMember}
              onChange={(e) => handleFilterChange('teamMember', e.target.value)}
              className="input-field"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Search
            </label>
            <input
              type="text"
              placeholder="Search in reports..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className="input-field"
            />
          </div>
        </div>
        
        <div className="mt-4 flex justify-between">
          <button
            onClick={() => setFilters({ startWeek: '', endWeek: '', teamMember: '', search: '' })}
            className="btn-secondary text-sm"
          >
            Clear Filters
          </button>
          <button
            onClick={exportToCSV}
            className="btn-primary text-sm"
          >
            Export to CSV
          </button>
        </div>
      </div>

      {/* Reports List */}
      <div className="space-y-4">
        {reports.length === 0 ? (
          <div className="card text-center py-12">
            <p className="text-gray-500">No reports found</p>
          </div>
        ) : (
          reports.map((report) => (
            <div key={report._id} className="card">
              <div
                className="flex justify-between items-start cursor-pointer"
                onClick={() => toggleReport(report._id)}
              >
                <div>
                  <h4 className="text-lg font-semibold text-gray-900">
                    Week {report.weekNumber} - {report.year}
                  </h4>
                  <p className="text-sm text-gray-600">
                    By {report.createdBy.name} • {new Date(report.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <svg
                  className={`w-5 h-5 text-gray-400 transform transition-transform ${
                    expandedReport === report._id ? 'rotate-180' : ''
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
              
              {expandedReport === report._id && (
                <div className="mt-4 space-y-4 border-t pt-4">
                  {/* Sales Section */}
                  {report.sales.length > 0 && (
                    <div>
                      <h5 className="font-semibold text-gray-900 mb-2">Sales</h5>
                      {report.sales.map((sale, index) => (
                        <div key={index} className="mb-3 p-3 bg-gray-50 rounded">
                          <div className="flex justify-between items-start mb-1">
                            <span className="font-medium text-sm">{sale.description}</span>
                            <span className={`text-xs px-2 py-1 rounded ${
                              sale.status === 'closed_won' ? 'bg-green-100 text-green-800' :
                              sale.status === 'closed_lost' ? 'bg-red-100 text-red-800' :
                              'bg-blue-100 text-blue-800'
                            }`}>
                              {sale.status.replace('_', ' ').toUpperCase()}
                            </span>
                          </div>
                          <div className="text-sm text-gray-600">
                            {sale.zones && <span>Zones: {sale.zones} • </span>}
                            {sale.yearlyValue && <span>Value: ${sale.yearlyValue.toLocaleString()} • </span>}
                            <span>Team: {sale.teamMember}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {/* Music Design Section */}
                  {report.musicDesign?.deliverables?.length > 0 && (
                    <div>
                      <h5 className="font-semibold text-gray-900 mb-2">Music Design Deliverables</h5>
                      <ul className="list-disc list-inside space-y-1">
                        {report.musicDesign.deliverables.map((deliverable, index) => (
                          <li key={index} className="text-sm text-gray-700">{deliverable}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {/* Tech/Ops Section */}
                  {report.techOps?.updates?.length > 0 && (
                    <div>
                      <h5 className="font-semibold text-gray-900 mb-2">Tech/Ops Updates</h5>
                      <ul className="list-disc list-inside space-y-1">
                        {report.techOps.updates.map((update, index) => (
                          <li key={index} className="text-sm text-gray-700">{update}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {/* Challenges */}
                  {report.challenges && (
                    <div>
                      <h5 className="font-semibold text-gray-900 mb-2">Challenges</h5>
                      <p className="text-sm text-gray-700">{report.challenges}</p>
                    </div>
                  )}
                  
                  {/* Next Week Priorities */}
                  {report.nextWeekPriorities?.length > 0 && (
                    <div>
                      <h5 className="font-semibold text-gray-900 mb-2">Next Week Priorities</h5>
                      <ul className="list-disc list-inside space-y-1">
                        {report.nextWeekPriorities.map((priority, index) => (
                          <li key={index} className="text-sm text-gray-700">{priority}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Reports;