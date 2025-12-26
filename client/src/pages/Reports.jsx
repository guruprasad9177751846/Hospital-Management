import React, { useState, useMemo } from 'react';
import { format, startOfMonth, endOfMonth, subMonths, eachDayOfInterval } from 'date-fns';
import { 
  HiOutlineChartBar,
  HiOutlineCalendarDays,
  HiOutlineArrowDownTray,
  HiOutlineDocumentArrowDown,
  HiOutlineCheckCircle,
  HiOutlineXCircle,
  HiOutlineMapPin
} from 'react-icons/hi2';
import { useChecklist, useExportChecklist } from '../hooks/useChecklist';
import { useActiveAreas } from '../hooks/useAreas';
import { Button, Select, DatePicker, Spinner, EmptyState } from '../components/common';

const Reports = () => {
  const [dateRange, setDateRange] = useState({
    start: format(startOfMonth(new Date()), 'yyyy-MM-dd'),
    end: format(endOfMonth(new Date()), 'yyyy-MM-dd')
  });
  const [selectedArea, setSelectedArea] = useState('');
  const [viewMode, setViewMode] = useState('summary'); // summary, daily
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [showExportMenu, setShowExportMenu] = useState(false);

  const { data: areas, isLoading: areasLoading } = useActiveAreas();
  const { data: checklist, isLoading: checklistLoading } = useChecklist(selectedDate, selectedArea || null);
  const { exportCSV, exportPDF } = useExportChecklist();

  const areaOptions = useMemo(() => {
    if (!areas) return [];
    return areas.map(area => ({
      value: area._id,
      label: area.name
    }));
  }, [areas]);

  const presetRanges = [
    { label: 'This Month', getValue: () => ({ start: startOfMonth(new Date()), end: new Date() }) },
    { label: 'Last Month', getValue: () => ({ start: startOfMonth(subMonths(new Date(), 1)), end: endOfMonth(subMonths(new Date(), 1)) }) },
    { label: 'Last 7 Days', getValue: () => ({ start: subMonths(new Date(), 0.25), end: new Date() }) },
    { label: 'Last 30 Days', getValue: () => ({ start: subMonths(new Date(), 1), end: new Date() }) },
  ];

  const handlePresetClick = (preset) => {
    const { start, end } = preset.getValue();
    setDateRange({
      start: format(start, 'yyyy-MM-dd'),
      end: format(end, 'yyyy-MM-dd')
    });
  };

  const handleExport = async (type) => {
    setShowExportMenu(false);
    if (type === 'csv') {
      await exportCSV(selectedDate, selectedArea || null);
    } else {
      await exportPDF(selectedDate, selectedArea || null);
    }
  };

  // Calculate summary statistics
  const summaryStats = useMemo(() => {
    if (!checklist) return null;
    
    const total = checklist.length;
    const completed = checklist.filter(item => item.entry?.status === true).length;
    const pending = total - completed;
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

    // Group by area
    const byArea = checklist.reduce((acc, item) => {
      const areaName = item.task.area?.name || 'Unknown';
      if (!acc[areaName]) {
        acc[areaName] = { total: 0, completed: 0 };
      }
      acc[areaName].total++;
      if (item.entry?.status === true) {
        acc[areaName].completed++;
      }
      return acc;
    }, {});

    return { total, completed, pending, completionRate, byArea };
  }, [checklist]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-display font-bold text-slate-800">
            Reports & Analytics
          </h1>
          <p className="text-slate-500 mt-1">
            View checklist completion statistics and export data
          </p>
        </div>

        {/* Export Button - Admin only (already on admin-only page) */}
        <div className="relative">
          <Button
            variant="secondary"
            icon={HiOutlineArrowDownTray}
            onClick={() => setShowExportMenu(!showExportMenu)}
          >
            Export Data
          </Button>
          
          {showExportMenu && (
            <>
              <div 
                className="fixed inset-0 z-40" 
                onClick={() => setShowExportMenu(false)} 
              />
              <div className="absolute right-0 mt-2 w-48 rounded-xl bg-white shadow-lg ring-1 ring-slate-200 z-50 animate-slide-down">
                <div className="py-1">
                  <button
                    onClick={() => handleExport('csv')}
                    className="flex items-center w-full px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    <HiOutlineDocumentArrowDown className="w-4 h-4 mr-3 text-emerald-500" />
                    Export as CSV
                  </button>
                  <button
                    onClick={() => handleExport('pdf')}
                    className="flex items-center w-full px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    <HiOutlineDocumentArrowDown className="w-4 h-4 mr-3 text-red-500" />
                    Export as PDF
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="card p-4">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Date Selection */}
          <div className="flex flex-col sm:flex-row gap-3 flex-1">
            <DatePicker
              label="Select Date"
              value={selectedDate}
              onChange={setSelectedDate}
              className="flex-1"
            />
            <Select
              label="Filter by Area"
              value={selectedArea}
              onChange={(e) => setSelectedArea(e.target.value)}
              options={areaOptions}
              placeholder="All Areas"
              className="flex-1"
            />
          </div>

          {/* Preset Buttons */}
          <div className="flex flex-wrap gap-2 lg:items-end">
            {presetRanges.map((preset) => (
              <button
                key={preset.label}
                onClick={() => {
                  const { start } = preset.getValue();
                  setSelectedDate(format(start, 'yyyy-MM-dd'));
                }}
                className="px-3 py-2 text-xs font-medium rounded-lg border border-slate-200 
                         text-slate-600 hover:bg-slate-50 hover:border-slate-300 
                         transition-colors"
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Loading State */}
      {(checklistLoading || areasLoading) && (
        <div className="card p-20">
          <div className="flex items-center justify-center">
            <Spinner size="large" />
          </div>
        </div>
      )}

      {/* Summary Statistics */}
      {summaryStats && !checklistLoading && (
        <>
          {/* Overview Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="card p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                  <HiOutlineChartBar className="w-5 h-5 text-blue-600" />
                </div>
              </div>
              <p className="text-2xl font-bold text-slate-800">{summaryStats.total}</p>
              <p className="text-sm text-slate-500">Total Tasks</p>
            </div>

            <div className="card p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
                  <HiOutlineCheckCircle className="w-5 h-5 text-emerald-600" />
                </div>
              </div>
              <p className="text-2xl font-bold text-emerald-600">{summaryStats.completed}</p>
              <p className="text-sm text-slate-500">Completed</p>
            </div>

            <div className="card p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
                  <HiOutlineXCircle className="w-5 h-5 text-amber-600" />
                </div>
              </div>
              <p className="text-2xl font-bold text-amber-600">{summaryStats.pending}</p>
              <p className="text-sm text-slate-500">Pending</p>
            </div>

            <div className="card p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-primary-100 flex items-center justify-center">
                  <HiOutlineCalendarDays className="w-5 h-5 text-primary-600" />
                </div>
              </div>
              <p className="text-2xl font-bold text-primary-600">{summaryStats.completionRate}%</p>
              <p className="text-sm text-slate-500">Completion Rate</p>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="card p-5">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">Overall Progress</h3>
            <div className="relative h-4 bg-slate-100 rounded-full overflow-hidden">
              <div 
                className="absolute h-full bg-gradient-to-r from-primary-500 to-medical-teal rounded-full transition-all duration-500"
                style={{ width: `${summaryStats.completionRate}%` }}
              />
            </div>
            <div className="flex justify-between mt-2 text-sm text-slate-500">
              <span>{summaryStats.completed} completed</span>
              <span>{summaryStats.pending} remaining</span>
            </div>
          </div>

          {/* By Area Breakdown */}
          <div className="card overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100">
              <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                <HiOutlineMapPin className="w-5 h-5 text-primary-500" />
                Completion by Area
              </h3>
            </div>
            <div className="divide-y divide-slate-100">
              {Object.entries(summaryStats.byArea).map(([areaName, stats]) => {
                const rate = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;
                return (
                  <div key={areaName} className="px-5 py-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-slate-700">{areaName}</span>
                      <span className="text-sm text-slate-500">
                        {stats.completed}/{stats.total} ({rate}%)
                      </span>
                    </div>
                    <div className="relative h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div 
                        className={`absolute h-full rounded-full transition-all duration-500 ${
                          rate === 100 
                            ? 'bg-emerald-500' 
                            : rate >= 50 
                              ? 'bg-amber-500' 
                              : 'bg-red-400'
                        }`}
                        style={{ width: `${rate}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Detailed Task List */}
          <div className="card overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100">
              <h3 className="text-lg font-semibold text-slate-800">
                Task Details for {format(new Date(selectedDate + 'T00:00:00'), 'MMMM d, yyyy')}
              </h3>
            </div>
            {checklist && checklist.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Task ID</th>
                      <th>Area</th>
                      <th>Task Name</th>
                      <th className="text-center">Status</th>
                      <th>Staff</th>
                      <th>Completed At</th>
                    </tr>
                  </thead>
                  <tbody>
                    {checklist.map((item) => (
                      <tr key={item.task._id}>
                        <td>
                          <span className="font-mono text-sm font-medium text-primary-600 bg-primary-50 px-2 py-1 rounded">
                            {item.task.taskId}
                          </span>
                        </td>
                        <td className="text-slate-600">{item.task.area?.name}</td>
                        <td className="font-medium text-slate-800">{item.task.name}</td>
                        <td>
                          <div className="flex justify-center">
                            {item.entry?.status ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">
                                <HiOutlineCheckCircle className="w-3.5 h-3.5" />
                                Done
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-500">
                                <HiOutlineXCircle className="w-3.5 h-3.5" />
                                Pending
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="text-slate-600">{item.entry?.staffName || '-'}</td>
                        <td className="text-sm text-slate-500">
                          {item.entry?.completedAt 
                            ? format(new Date(item.entry.completedAt), 'MMM d, h:mm a')
                            : '-'
                          }
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <EmptyState
                icon={HiOutlineChartBar}
                title="No tasks found"
                description="No tasks are configured for the selected date and area."
              />
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default Reports;

