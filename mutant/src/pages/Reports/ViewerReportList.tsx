// src/pages/Reports/ViewerReportList.tsx
import React from 'react';
import ReportList from './ReportList';
import type { Report } from '../../api/data/reportTools'; // Import Report type

// Define the predicate function.
// This example allows only reports with specific IDs.
// You can customize this logic as needed (e.g., filter by name, category, etc.).
const VIEWER_ALLOWED_REPORT_IDS: number[] = [26, 27, 28, 29,]; // Example: Allow reports with ID 1, 3, or 5

/**
 * Predicate function to filter reports for the viewer.
 * @param report The report object to check.
 * @returns True if the report should be included, false otherwise.
 */
const viewerReportFilter = (report: Report): boolean => {
  return VIEWER_ALLOWED_REPORT_IDS.includes(report.id);
};

const ViewerReportList: React.FC = () => {
  return (
    <ReportList reportFilterPredicate={viewerReportFilter} />
  );
};

export default ViewerReportList;