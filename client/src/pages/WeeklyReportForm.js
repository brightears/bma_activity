import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

// Helper function to get week number
const getWeekNumber = (date) => {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(),0,1));
  return Math.ceil((((d - yearStart) / 86400000) + 1)/7);
};

const WeeklyReportForm = () => {
  const navigate = useNavigate();
  const user = { email: 'team@bmasiapte.com', name: 'BMA Team' };
  
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  
  const [formData, setFormData] = useState({
    weekNumber: getWeekNumber(new Date()),
    year: new Date().getFullYear(),
    
    // Sales
    sales: [
      {
        status: '',
        description: '',
        zones: '',
        yearlyValue: '',
        teamMember: user?.name || ''
      }
    ],
    
    // Music Design
    musicDesign: {
      deliverables: ['']
    },
    
    // Tech/Ops
    techOps: {
      updates: ['']
    },
    
    // Challenges
    challenges: '',
    
    // Next Week
    nextWeekPriorities: ['']
  });

  const handleChange = (section, field, value, index = null) => {
    setFormData(prev => {
      const newData = { ...prev };
      
      if (index !== null) {
        if (section === 'sales') {
          newData[section][index][field] = value;
        } else if (field === 'deliverables' || field === 'updates' || section === 'nextWeekPriorities') {
          if (section === 'nextWeekPriorities') {
            newData[section][index] = value;
          } else {
            newData[section][field][index] = value;
          }
        }
      } else {
        if (section === 'general') {
          newData[field] = value;
        } else {
          newData[section][field] = value;
        }
      }
      
      return newData;
    });
  };

  const addSalesItem = () => {
    setFormData(prev => ({
      ...prev,
      sales: [...prev.sales, {
        status: '',
        description: '',
        zones: '',
        yearlyValue: '',
        teamMember: user?.name || ''
      }]
    }));
  };

  const removeSalesItem = (index) => {
    setFormData(prev => ({
      ...prev,
      sales: prev.sales.filter((_, i) => i !== index)
    }));
  };

  const addArrayItem = (section, field) => {
    setFormData(prev => {
      const newData = { ...prev };
      if (section === 'nextWeekPriorities') {
        newData[section] = [...newData[section], ''];
      } else {
        newData[section][field] = [...newData[section][field], ''];
      }
      return newData;
    });
  };

  const removeArrayItem = (section, field, index) => {
    setFormData(prev => {
      const newData = { ...prev };
      if (section === 'nextWeekPriorities') {
        newData[section] = newData[section].filter((_, i) => i !== index);
      } else {
        newData[section][field] = newData[section][field].filter((_, i) => i !== index);
      }
      return newData;
    });
  };

  const validateForm = () => {
    const newErrors = {};
    
    // Validate sales
    formData.sales.forEach((sale, index) => {
      if (!sale.description) {
        newErrors[`sales_${index}_description`] = 'Description is required';
      }
      if (!sale.status) {
        newErrors[`sales_${index}_status`] = 'Status is required';
      }
    });
    
    // Validate deliverables
    const hasDeliverables = formData.musicDesign.deliverables.some(d => d.trim());
    if (!hasDeliverables) {
      newErrors.deliverables = 'At least one deliverable is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    
    try {
      // Clean up empty array items
      const cleanedData = {
        ...formData,
        musicDesign: {
          deliverables: formData.musicDesign.deliverables.filter(d => d.trim())
        },
        techOps: {
          updates: formData.techOps.updates.filter(u => u.trim())
        },
        nextWeekPriorities: formData.nextWeekPriorities.filter(p => p.trim())
      };
      
      await axios.post('/api/reports', cleanedData);
      
      // Show success message and redirect
      alert('Report submitted successfully!');
      navigate('/reports');
    } catch (error) {
      console.error('Error submitting report:', error);
      alert(error.response?.data?.message || 'Failed to submit report');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="card">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Weekly Activity Report</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Week Number
            </label>
            <input
              type="number"
              value={formData.weekNumber}
              onChange={(e) => handleChange('general', 'weekNumber', e.target.value)}
              className="input-field"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Year
            </label>
            <input
              type="number"
              value={formData.year}
              onChange={(e) => handleChange('general', 'year', e.target.value)}
              className="input-field"
              required
            />
          </div>
        </div>
      </div>

      {/* Sales Section */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Sales</h3>
        {formData.sales.map((sale, index) => (
          <div key={index} className="mb-6 p-4 bg-gray-50 rounded-lg">
            <div className="flex justify-between items-start mb-4">
              <h4 className="font-medium text-gray-700">Sales Item {index + 1}</h4>
              {formData.sales.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeSalesItem(index)}
                  className="text-red-600 hover:text-red-800 text-sm"
                >
                  Remove
                </button>
              )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status <span className="text-red-500">*</span>
                </label>
                <select
                  value={sale.status}
                  onChange={(e) => handleChange('sales', 'status', e.target.value, index)}
                  className={`input-field ${errors[`sales_${index}_status`] ? 'border-red-500' : ''}`}
                  required
                >
                  <option value="">Select status</option>
                  <option value="prospecting">Prospecting</option>
                  <option value="initial_contact">Initial Contact</option>
                  <option value="qualification">Qualification</option>
                  <option value="proposal">Proposal</option>
                  <option value="negotiation">Negotiation</option>
                  <option value="closed_won">Closed Won</option>
                  <option value="closed_lost">Closed Lost</option>
                </select>
                {errors[`sales_${index}_status`] && (
                  <p className="text-red-500 text-xs mt-1">{errors[`sales_${index}_status`]}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Zones
                </label>
                <input
                  type="text"
                  value={sale.zones}
                  onChange={(e) => handleChange('sales', 'zones', e.target.value, index)}
                  className="input-field"
                  placeholder="e.g., Singapore, Malaysia"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Yearly Value ($)
                </label>
                <input
                  type="number"
                  value={sale.yearlyValue}
                  onChange={(e) => handleChange('sales', 'yearlyValue', e.target.value, index)}
                  className="input-field"
                  placeholder="0"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Team Member
                </label>
                <input
                  type="text"
                  value={sale.teamMember}
                  onChange={(e) => handleChange('sales', 'teamMember', e.target.value, index)}
                  className="input-field"
                />
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={sale.description}
                  onChange={(e) => handleChange('sales', 'description', e.target.value, index)}
                  className={`input-field ${errors[`sales_${index}_description`] ? 'border-red-500' : ''}`}
                  rows="3"
                  required
                  placeholder="Describe the sales activity..."
                />
                {errors[`sales_${index}_description`] && (
                  <p className="text-red-500 text-xs mt-1">{errors[`sales_${index}_description`]}</p>
                )}
              </div>
            </div>
          </div>
        ))}
        
        <button
          type="button"
          onClick={addSalesItem}
          className="btn-secondary text-sm"
        >
          + Add Sales Item
        </button>
      </div>

      {/* Music Design Section */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Music Design</h3>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Deliverables <span className="text-red-500">*</span>
        </label>
        {formData.musicDesign.deliverables.map((deliverable, index) => (
          <div key={index} className="flex gap-2 mb-2">
            <input
              type="text"
              value={deliverable}
              onChange={(e) => handleChange('musicDesign', 'deliverables', e.target.value, index)}
              className="input-field"
              placeholder="Enter deliverable..."
            />
            {formData.musicDesign.deliverables.length > 1 && (
              <button
                type="button"
                onClick={() => removeArrayItem('musicDesign', 'deliverables', index)}
                className="text-red-600 hover:text-red-800"
              >
                Remove
              </button>
            )}
          </div>
        ))}
        {errors.deliverables && (
          <p className="text-red-500 text-xs mt-1">{errors.deliverables}</p>
        )}
        <button
          type="button"
          onClick={() => addArrayItem('musicDesign', 'deliverables')}
          className="btn-secondary text-sm mt-2"
        >
          + Add Deliverable
        </button>
      </div>

      {/* Tech/Ops Section */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Tech/Ops</h3>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Updates
        </label>
        {formData.techOps.updates.map((update, index) => (
          <div key={index} className="flex gap-2 mb-2">
            <input
              type="text"
              value={update}
              onChange={(e) => handleChange('techOps', 'updates', e.target.value, index)}
              className="input-field"
              placeholder="Enter update..."
            />
            {formData.techOps.updates.length > 1 && (
              <button
                type="button"
                onClick={() => removeArrayItem('techOps', 'updates', index)}
                className="text-red-600 hover:text-red-800"
              >
                Remove
              </button>
            )}
          </div>
        ))}
        <button
          type="button"
          onClick={() => addArrayItem('techOps', 'updates')}
          className="btn-secondary text-sm mt-2"
        >
          + Add Update
        </button>
      </div>

      {/* Challenges Section */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Challenges</h3>
        <textarea
          value={formData.challenges}
          onChange={(e) => handleChange('general', 'challenges', e.target.value)}
          className="input-field"
          rows="4"
          placeholder="Describe any challenges faced this week..."
        />
      </div>

      {/* Next Week Priorities */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Next Week Priorities</h3>
        {formData.nextWeekPriorities.map((priority, index) => (
          <div key={index} className="flex gap-2 mb-2">
            <input
              type="text"
              value={priority}
              onChange={(e) => handleChange('nextWeekPriorities', null, e.target.value, index)}
              className="input-field"
              placeholder="Enter priority..."
            />
            {formData.nextWeekPriorities.length > 1 && (
              <button
                type="button"
                onClick={() => removeArrayItem('nextWeekPriorities', null, index)}
                className="text-red-600 hover:text-red-800"
              >
                Remove
              </button>
            )}
          </div>
        ))}
        <button
          type="button"
          onClick={() => addArrayItem('nextWeekPriorities')}
          className="btn-secondary text-sm mt-2"
        >
          + Add Priority
        </button>
      </div>

      {/* Submit Button */}
      <div className="flex justify-end gap-4">
        <button
          type="button"
          onClick={() => navigate('/dashboard')}
          className="btn-secondary"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="btn-primary"
        >
          {loading ? 'Submitting...' : 'Submit Report'}
        </button>
      </div>
    </form>
  );
};

export default WeeklyReportForm;