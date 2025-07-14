import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useSupabaseAuth } from '../contexts/SupabaseAuth';

const ReportForm = ({ editMode = false }) => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { apiCall, profile } = useSupabaseAuth();
  
  // Get current week and year
  const now = new Date();
  const currentWeek = Math.ceil(((now - new Date(now.getFullYear(), 0, 1)) / 86400000 + 1) / 7);
  const currentYear = now.getFullYear();
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    week_number: currentWeek,
    year: currentYear,
    sales_items: [],
    music_items: [],
    tech_items: [],
    challenges: [''],
    priorities: ['']
  });

  // Load existing report if in edit mode
  useEffect(() => {
    if (editMode && id) {
      loadReport();
    }
  }, [editMode, id]);

  const loadReport = async () => {
    try {
      setLoading(true);
      const data = await apiCall(`/reports/${id}`);
      
      setFormData({
        week_number: data.week_number,
        year: data.year,
        sales_items: data.sales_items || [],
        music_items: data.music_items || [],
        tech_items: data.tech_items || [],
        challenges: data.challenges.map(c => c.description) || [''],
        priorities: data.priorities.map(p => p.description) || ['']
      });
    } catch (err) {
      setError('Failed to load report');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Add new sales item
  const addSalesItem = () => {
    setFormData(prev => ({
      ...prev,
      sales_items: [...prev.sales_items, {
        date: new Date().toISOString().split('T')[0],
        status: 'New',
        region: 'INT',
        description: '',
        zones: '',
        yearly_value: 0,
        team_member: profile?.full_name || ''
      }]
    }));
  };

  // Remove sales item
  const removeSalesItem = (index) => {
    setFormData(prev => ({
      ...prev,
      sales_items: prev.sales_items.filter((_, i) => i !== index)
    }));
  };

  // Update sales item
  const updateSalesItem = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      sales_items: prev.sales_items.map((item, i) => 
        i === index ? { ...item, [field]: value } : item
      )
    }));
  };

  // Add new music item
  const addMusicItem = () => {
    setFormData(prev => ({
      ...prev,
      music_items: [...prev.music_items, {
        date: new Date().toISOString().split('T')[0],
        description: '',
        team_member: profile?.full_name || ''
      }]
    }));
  };

  // Remove music item
  const removeMusicItem = (index) => {
    setFormData(prev => ({
      ...prev,
      music_items: prev.music_items.filter((_, i) => i !== index)
    }));
  };

  // Update music item
  const updateMusicItem = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      music_items: prev.music_items.map((item, i) => 
        i === index ? { ...item, [field]: value } : item
      )
    }));
  };

  // Add new tech item
  const addTechItem = () => {
    setFormData(prev => ({
      ...prev,
      tech_items: [...prev.tech_items, {
        date: new Date().toISOString().split('T')[0],
        description: '',
        team_member: profile?.full_name || ''
      }]
    }));
  };

  // Remove tech item
  const removeTechItem = (index) => {
    setFormData(prev => ({
      ...prev,
      tech_items: prev.tech_items.filter((_, i) => i !== index)
    }));
  };

  // Update tech item
  const updateTechItem = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      tech_items: prev.tech_items.map((item, i) => 
        i === index ? { ...item, [field]: value } : item
      )
    }));
  };

  // Update challenges
  const updateChallenge = (index, value) => {
    setFormData(prev => ({
      ...prev,
      challenges: prev.challenges.map((item, i) => 
        i === index ? value : item
      )
    }));
  };

  // Add challenge
  const addChallenge = () => {
    setFormData(prev => ({
      ...prev,
      challenges: [...prev.challenges, '']
    }));
  };

  // Remove challenge
  const removeChallenge = (index) => {
    if (formData.challenges.length > 1) {
      setFormData(prev => ({
        ...prev,
        challenges: prev.challenges.filter((_, i) => i !== index)
      }));
    }
  };

  // Update priorities
  const updatePriority = (index, value) => {
    setFormData(prev => ({
      ...prev,
      priorities: prev.priorities.map((item, i) => 
        i === index ? value : item
      )
    }));
  };

  // Add priority
  const addPriority = () => {
    setFormData(prev => ({
      ...prev,
      priorities: [...prev.priorities, '']
    }));
  };

  // Remove priority
  const removePriority = (index) => {
    if (formData.priorities.length > 1) {
      setFormData(prev => ({
        ...prev,
        priorities: prev.priorities.filter((_, i) => i !== index)
      }));
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Filter out empty challenges and priorities
      const dataToSubmit = {
        ...formData,
        challenges: formData.challenges.filter(c => c.trim()),
        priorities: formData.priorities.filter(p => p.trim())
      };

      const result = await apiCall('/reports/submit', {
        method: 'POST',
        body: JSON.stringify(dataToSubmit)
      });

      navigate(`/report/${result.report.id}`);
    } catch (err) {
      setError(err.message || 'Failed to submit report');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Calculate totals
  const calculateTotals = () => {
    const totalYearlyValue = formData.sales_items.reduce((sum, item) => 
      sum + (parseFloat(item.yearly_value) || 0), 0
    );
    const totalMRR = totalYearlyValue / 12;
    const intYearlyValue = formData.sales_items
      .filter(item => item.region === 'INT')
      .reduce((sum, item) => sum + (parseFloat(item.yearly_value) || 0), 0);
    const thYearlyValue = formData.sales_items
      .filter(item => item.region === 'TH')
      .reduce((sum, item) => sum + (parseFloat(item.yearly_value) || 0), 0);

    return { totalYearlyValue, totalMRR, intYearlyValue, thYearlyValue };
  };

  const { totalYearlyValue, totalMRR, intYearlyValue, thYearlyValue } = calculateTotals();

  if (loading && editMode) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading report...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <h1 className="text-3xl font-bold mb-6">
        {editMode ? 'Edit Report' : 'New Weekly Report'}
      </h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Week and Year */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Report Period</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Week Number</label>
              <input
                type="number"
                min="1"
                max="53"
                value={formData.week_number}
                onChange={(e) => setFormData(prev => ({ ...prev, week_number: parseInt(e.target.value) }))}
                className="w-full p-2 border rounded"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Year</label>
              <input
                type="number"
                min="2020"
                max="2030"
                value={formData.year}
                onChange={(e) => setFormData(prev => ({ ...prev, year: parseInt(e.target.value) }))}
                className="w-full p-2 border rounded"
                required
              />
            </div>
          </div>
        </div>

        {/* Sales Activities */}
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Sales Activities</h2>
            <button
              type="button"
              onClick={addSalesItem}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Add Sales Item
            </button>
          </div>

          {formData.sales_items.map((item, index) => (
            <div key={index} className="border p-4 rounded mb-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Date</label>
                  <input
                    type="date"
                    value={item.date}
                    onChange={(e) => updateSalesItem(index, 'date', e.target.value)}
                    className="w-full p-2 border rounded"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Status</label>
                  <select
                    value={item.status}
                    onChange={(e) => updateSalesItem(index, 'status', e.target.value)}
                    className="w-full p-2 border rounded"
                    required
                  >
                    <option value="New">New</option>
                    <option value="Existing">Existing</option>
                    <option value="Renewal">Renewal</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Region</label>
                  <select
                    value={item.region}
                    onChange={(e) => updateSalesItem(index, 'region', e.target.value)}
                    className="w-full p-2 border rounded"
                    required
                  >
                    <option value="INT">International (USD)</option>
                    <option value="TH">Thailand (THB)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Yearly Value</label>
                  <input
                    type="number"
                    value={item.yearly_value}
                    onChange={(e) => updateSalesItem(index, 'yearly_value', parseFloat(e.target.value) || 0)}
                    className="w-full p-2 border rounded"
                    step="0.01"
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-1">Description</label>
                  <input
                    type="text"
                    value={item.description}
                    onChange={(e) => updateSalesItem(index, 'description', e.target.value)}
                    className="w-full p-2 border rounded"
                    placeholder="Deal description"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Zones</label>
                  <input
                    type="text"
                    value={item.zones}
                    onChange={(e) => updateSalesItem(index, 'zones', e.target.value)}
                    className="w-full p-2 border rounded"
                    placeholder="e.g., Z1, Z2"
                  />
                </div>
              </div>
              <div className="mt-4 flex justify-end">
                <button
                  type="button"
                  onClick={() => removeSalesItem(index)}
                  className="text-red-600 hover:text-red-800"
                >
                  Remove
                </button>
              </div>
            </div>
          ))}

          {/* Totals */}
          <div className="mt-4 p-4 bg-gray-50 rounded">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="font-medium">Total Yearly:</span> ${totalYearlyValue.toFixed(2)}
              </div>
              <div>
                <span className="font-medium">Total MRR:</span> ${totalMRR.toFixed(2)}
              </div>
              <div>
                <span className="font-medium">INT:</span> ${intYearlyValue.toFixed(2)}
              </div>
              <div>
                <span className="font-medium">TH:</span> ฿{thYearlyValue.toFixed(2)}
              </div>
            </div>
          </div>
        </div>

        {/* Music Design Deliverables */}
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Music Design Deliverables</h2>
            <button
              type="button"
              onClick={addMusicItem}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Add Music Item
            </button>
          </div>

          {formData.music_items.map((item, index) => (
            <div key={index} className="border p-4 rounded mb-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Date</label>
                  <input
                    type="date"
                    value={item.date}
                    onChange={(e) => updateMusicItem(index, 'date', e.target.value)}
                    className="w-full p-2 border rounded"
                    required
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-1">Description</label>
                  <input
                    type="text"
                    value={item.description}
                    onChange={(e) => updateMusicItem(index, 'description', e.target.value)}
                    className="w-full p-2 border rounded"
                    placeholder="Music deliverable description"
                    required
                  />
                </div>
              </div>
              <div className="mt-4 flex justify-end">
                <button
                  type="button"
                  onClick={() => removeMusicItem(index)}
                  className="text-red-600 hover:text-red-800"
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Tech/Ops Activities */}
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Tech/Ops Activities</h2>
            <button
              type="button"
              onClick={addTechItem}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Add Tech Item
            </button>
          </div>

          {formData.tech_items.map((item, index) => (
            <div key={index} className="border p-4 rounded mb-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Date</label>
                  <input
                    type="date"
                    value={item.date}
                    onChange={(e) => updateTechItem(index, 'date', e.target.value)}
                    className="w-full p-2 border rounded"
                    required
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-1">Description</label>
                  <input
                    type="text"
                    value={item.description}
                    onChange={(e) => updateTechItem(index, 'description', e.target.value)}
                    className="w-full p-2 border rounded"
                    placeholder="Tech/Ops activity description"
                    required
                  />
                </div>
              </div>
              <div className="mt-4 flex justify-end">
                <button
                  type="button"
                  onClick={() => removeTechItem(index)}
                  className="text-red-600 hover:text-red-800"
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Challenges */}
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Challenges</h2>
            <button
              type="button"
              onClick={addChallenge}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Add Challenge
            </button>
          </div>

          {formData.challenges.map((challenge, index) => (
            <div key={index} className="flex gap-2 mb-2">
              <textarea
                value={challenge}
                onChange={(e) => updateChallenge(index, e.target.value)}
                className="flex-1 p-2 border rounded"
                rows="2"
                placeholder="Describe a challenge..."
              />
              {formData.challenges.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeChallenge(index)}
                  className="text-red-600 hover:text-red-800 px-2"
                >
                  Remove
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Priorities */}
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Priorities for Next Week</h2>
            <button
              type="button"
              onClick={addPriority}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Add Priority
            </button>
          </div>

          {formData.priorities.map((priority, index) => (
            <div key={index} className="flex gap-2 mb-2">
              <textarea
                value={priority}
                onChange={(e) => updatePriority(index, e.target.value)}
                className="flex-1 p-2 border rounded"
                rows="2"
                placeholder="Describe a priority..."
              />
              {formData.priorities.length > 1 && (
                <button
                  type="button"
                  onClick={() => removePriority(index)}
                  className="text-red-600 hover:text-red-800 px-2"
                >
                  Remove
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Submit Buttons */}
        <div className="flex gap-4 justify-end">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Submitting...' : (editMode ? 'Update Report' : 'Submit Report')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ReportForm;