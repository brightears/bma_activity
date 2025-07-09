import React, { useEffect, useState } from 'react';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import axios from 'axios';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalReports: 0,
    salesPipeline: 0,
    activeSales: 0,
    completedProjects: 0
  });
  const [salesData, setSalesData] = useState(null);
  const [projectsData, setProjectsData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await axios.get('/api/dashboard/stats');
      setStats(response.data.stats);
      setSalesData(response.data.salesChart);
      setProjectsData(response.data.projectsChart);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const salesChartData = {
    labels: salesData?.labels || [],
    datasets: [
      {
        label: 'Sales Pipeline Value',
        data: salesData?.data || [],
        borderColor: '#E31937',
        backgroundColor: 'rgba(227, 25, 55, 0.1)',
        tension: 0.4
      }
    ]
  };

  const projectsChartData = {
    labels: projectsData?.labels || [],
    datasets: [
      {
        label: 'Projects by Status',
        data: projectsData?.data || [],
        backgroundColor: [
          '#E31937',
          '#4A4A4A',
          '#F5F5F5',
          '#FF6B6B',
          '#4ECDC4'
        ]
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom',
      }
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
      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-bma-red rounded-md p-3">
              <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">Total Reports</dt>
                <dd className="text-lg font-bold text-gray-900">{stats.totalReports}</dd>
              </dl>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-green-500 rounded-md p-3">
              <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">Sales Pipeline</dt>
                <dd className="text-lg font-bold text-gray-900">${stats.salesPipeline.toLocaleString()}</dd>
              </dl>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-blue-500 rounded-md p-3">
              <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">Active Sales</dt>
                <dd className="text-lg font-bold text-gray-900">{stats.activeSales}</dd>
              </dl>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-purple-500 rounded-md p-3">
              <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">Completed Projects</dt>
                <dd className="text-lg font-bold text-gray-900">{stats.completedProjects}</dd>
              </dl>
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Sales Pipeline Trend</h3>
          <Line data={salesChartData} options={chartOptions} />
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Projects by Status</h3>
          <Doughnut data={projectsChartData} options={chartOptions} />
        </div>
      </div>

      {/* Recent Activity */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
        <div className="space-y-4">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <div className="flex items-center justify-center h-8 w-8 rounded-full bg-bma-red text-white text-sm">
                JD
              </div>
            </div>
            <div className="ml-3">
              <p className="text-sm text-gray-900">
                <span className="font-medium">John Doe</span> submitted a weekly report
              </p>
              <p className="text-sm text-gray-500">2 hours ago</p>
            </div>
          </div>
          
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <div className="flex items-center justify-center h-8 w-8 rounded-full bg-green-500 text-white text-sm">
                MS
              </div>
            </div>
            <div className="ml-3">
              <p className="text-sm text-gray-900">
                <span className="font-medium">Mary Smith</span> updated sales pipeline
              </p>
              <p className="text-sm text-gray-500">5 hours ago</p>
            </div>
          </div>
          
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <div className="flex items-center justify-center h-8 w-8 rounded-full bg-blue-500 text-white text-sm">
                RJ
              </div>
            </div>
            <div className="ml-3">
              <p className="text-sm text-gray-900">
                <span className="font-medium">Robert Johnson</span> completed a project
              </p>
              <p className="text-sm text-gray-500">1 day ago</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;