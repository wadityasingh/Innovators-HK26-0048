import React, { useState } from 'react';
import { X, Download, FileSpreadsheet, Printer, CheckCircle, Code2 } from 'lucide-react';
import { BuildingData, MonthlyConsumption } from '../../types';

interface ExportReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  buildings: BuildingData[];
  monthlyData: MonthlyConsumption[];
}

export const ExportReportModal: React.FC<ExportReportModalProps> = ({
  isOpen,
  onClose,
  buildings,
  monthlyData,
}) => {
  const [reportType, setReportType] = useState<'department' | 'monthly' | 'carbon'>('department');
  const [exportFormat, setExportFormat] = useState<'csv' | 'json'>('csv');
  const [downloaded, setDownloaded] = useState(false);

  if (!isOpen) return null;

  // Flatten all departments
  const allDepartments = buildings.flatMap((b) =>
    b.departments.map((d) => ({
      ...d,
      buildingName: b.name,
      buildingCode: b.code,
      buildingCategory: b.category,
      grossAreaSqFt: b.grossAreaSqFt,
    }))
  );

  const handleDownload = () => {
    const timestamp = new Date().toISOString().split('T')[0];

    if (exportFormat === 'json') {
      let jsonPayload: any = {};
      if (reportType === 'department') {
        jsonPayload = {
          report: 'Departmental Resource Consumption Ledger',
          campus: 'GreenCampus University',
          date: timestamp,
          departments: allDepartments,
        };
      } else if (reportType === 'monthly') {
        jsonPayload = {
          report: 'Monthly Consumption & Target Ceilings History',
          campus: 'GreenCampus University',
          date: timestamp,
          monthlyData,
        };
      } else {
        jsonPayload = {
          report: 'Estimated Carbon Accounting Model',
          campus: 'GreenCampus University',
          date: timestamp,
          scopes: [
            { scope: 1, source: 'Central Heating Natural Gas', co2eMT: 42.5 },
            { scope: 2, source: 'Purchased Grid Electricity', co2eMT: 249.6 },
            { scope: 3, source: 'Solid Waste & Paper Pulp', co2eMT: 14.2 },
          ],
        };
      }

      const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(jsonPayload, null, 2));
      const link = document.createElement('a');
      link.setAttribute('href', dataStr);
      link.setAttribute('download', `GreenCampus_${reportType}_${timestamp}.json`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      // CSV Format
      let csvContent = 'data:text/csv;charset=utf-8,';

      if (reportType === 'department') {
        csvContent += 'GreenCampus University — Departmental Resource Consumption Ledger (Oct 2026 MTD)\r\n';
        csvContent += 'Building Name,Building Code,Category,Department / Location,Location Code,Type,Electricity (kWh),Water (Litres),Water (kL),Paper (Sheets),Waste (kg),Reporting Status\r\n';
        allDepartments.forEach((d) => {
          const elec = d.electricityKwh !== null ? d.electricityKwh : 'MISSING';
          const waterL = d.waterLitres !== null ? d.waterLitres : 'MISSING';
          const waterKL = d.waterLitres !== null ? (d.waterLitres / 1000).toFixed(2) : 'MISSING';
          const paper = d.paperSheets !== null ? d.paperSheets : 'MISSING';
          const waste = d.wasteKg !== null ? d.wasteKg : 'MISSING';
          csvContent += `"${d.buildingName}","${d.buildingCode}","${d.buildingCategory}","${d.name}","${d.code}","${d.type}",${elec},${waterL},${waterKL},${paper},${waste},"${d.reportingStatus}"\r\n`;
        });
      } else if (reportType === 'monthly') {
        csvContent += 'GreenCampus University — Monthly Consumption History (May - Oct 2026)\r\n';
        csvContent += 'Month,Electricity (kWh),Electricity Target (kWh),Water (Litres),Water Target (Litres),Paper (Sheets),Paper Target (Sheets),Waste (kg),Diverted Waste (kg),Reporting Completeness (%)\r\n';
        monthlyData.forEach((m) => {
          csvContent += `"${m.month}",${m.electricityKwh},${m.targetElectricityKwh},${m.waterLitres},${m.targetWaterLitres},${m.paperSheets},${m.targetPaperSheets},${m.wasteKg},${m.divertedWasteKg},${m.reportingCompletenessPercent}%\r\n`;
        });
      } else {
        csvContent += 'GreenCampus University — Estimated Carbon Accounting Summary (Scopes 1-3 Model)\r\n';
        csvContent += 'Emissions Category,Scope,Estimated Metric,Value,Unit,Emissions Factor Basis\r\n';
        csvContent += '"Central Heating Natural Gas",Scope 1,Fuel Combustion,42.5,"MT CO2e","Campus steam boiler fuel inventory"\r\n';
        csvContent += '"Purchased Grid Electricity",Scope 2,Electricity,249.6,"MT CO2e","Regional grid 0.385 kg CO2e / kWh"\r\n';
        csvContent += '"Solid Waste & Paper Pulp",Scope 3,Materials & Waste,14.2,"MT CO2e","Landfill methane decay & paper supply"\r\n';
      }

      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', `GreenCampus_${reportType}_${timestamp}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }

    setDownloaded(true);
    setTimeout(() => setDownloaded(false), 2500);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="bg-white border border-slate-200 rounded-xl max-w-2xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-200 bg-slate-50/50">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Export Campus Resource Report</h3>
            <p className="text-xs text-slate-500">Download formatted CSV or JSON datasets, or print report</p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs">
          {/* Format Selection (CSV vs JSON) */}
          <div className="flex items-center justify-between p-2.5 bg-slate-50 border border-slate-200 rounded-lg">
            <span className="font-semibold text-slate-700">Export File Format:</span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setExportFormat('csv')}
                className={`px-3 py-1 rounded text-xs font-semibold flex items-center gap-1 transition-colors ${
                  exportFormat === 'csv'
                    ? 'bg-emerald-800 text-white shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <FileSpreadsheet className="w-3.5 h-3.5" />
                <span>CSV Spreadsheet</span>
              </button>
              <button
                type="button"
                onClick={() => setExportFormat('json')}
                className={`px-3 py-1 rounded text-xs font-semibold flex items-center gap-1 transition-colors ${
                  exportFormat === 'json'
                    ? 'bg-emerald-800 text-white shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Code2 className="w-3.5 h-3.5" />
                <span>JSON Payload</span>
              </button>
            </div>
          </div>

          {/* Dataset selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Select Dataset Scope
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setReportType('department')}
                className={`p-3 rounded-lg border text-left transition-all ${
                  reportType === 'department'
                    ? 'bg-emerald-50 border-emerald-500 text-emerald-950 font-semibold'
                    : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700'
                }`}
              >
                <div className="font-bold">Departmental Ledger</div>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  14 departments & locations with kWh, Litres, Sheets, kg, and missing status
                </div>
              </button>

              <button
                type="button"
                onClick={() => setReportType('monthly')}
                className={`p-3 rounded-lg border text-left transition-all ${
                  reportType === 'monthly'
                    ? 'bg-emerald-50 border-emerald-500 text-emerald-950 font-semibold'
                    : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700'
                }`}
              >
                <div className="font-bold">Monthly Trend History</div>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  May - Oct 2026 monthly consumption vs target ceilings
                </div>
              </button>

              <button
                type="button"
                onClick={() => setReportType('carbon')}
                className={`p-3 rounded-lg border text-left transition-all ${
                  reportType === 'carbon'
                    ? 'bg-emerald-50 border-emerald-500 text-emerald-950 font-semibold'
                    : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700'
                }`}
              >
                <div className="font-bold">Estimated Carbon Model</div>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  Scopes 1, 2, and 3 calculations based on utility coefficients
                </div>
              </button>
            </div>
          </div>

          {/* Table Preview */}
          <div className="border border-slate-200 rounded-lg overflow-hidden">
            <div className="bg-slate-50 px-3 py-2 border-b border-slate-200 font-semibold text-slate-800 flex items-center justify-between">
              <span>Data Export Preview (First 4 Records)</span>
              <span className="text-[11px] font-mono text-slate-500">
                Format: {exportFormat.toUpperCase()} / UTF-8
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-[11px] text-left">
                <thead className="bg-slate-100/70 border-b border-slate-200 text-slate-600 font-mono">
                  <tr>
                    <th className="py-2 px-3">Facility</th>
                    <th className="py-2 px-3">Department</th>
                    <th className="py-2 px-3">Electricity (kWh)</th>
                    <th className="py-2 px-3">Water (Litres)</th>
                    <th className="py-2 px-3">Paper (Sheets)</th>
                    <th className="py-2 px-3">Waste (kg)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-150">
                  {allDepartments.slice(0, 4).map((d) => (
                    <tr key={d.id} className="hover:bg-slate-50">
                      <td className="py-2 px-3 font-medium text-slate-800">{d.buildingName}</td>
                      <td className="py-2 px-3 text-slate-600">{d.name}</td>
                      <td className="py-2 px-3 font-mono font-semibold text-emerald-700">
                        {d.electricityKwh !== null ? d.electricityKwh.toLocaleString() : 'MISSING'}
                      </td>
                      <td className="py-2 px-3 font-mono text-sky-700">
                        {d.waterLitres !== null ? `${(d.waterLitres / 1000).toLocaleString()} kL` : 'MISSING'}
                      </td>
                      <td className="py-2 px-3 font-mono text-amber-700">
                        {d.paperSheets !== null ? d.paperSheets.toLocaleString() : 'MISSING'}
                      </td>
                      <td className="py-2 px-3 font-mono text-slate-700">
                        {d.wasteKg !== null ? d.wasteKg.toLocaleString() : 'MISSING'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {downloaded && (
            <div className="p-2.5 bg-emerald-50 border border-emerald-300 rounded-lg flex items-center gap-2 text-emerald-900 font-medium">
              <CheckCircle className="w-4 h-4 text-emerald-600" />
              <span>
                {exportFormat.toUpperCase()} file downloaded successfully to your browser.
              </span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-5 py-3 border-t border-slate-200 bg-slate-50/50">
          <button
            type="button"
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-200/60 rounded-lg border border-slate-300"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print / PDF View</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-800 rounded-lg"
            >
              Close
            </button>
            <button
              type="button"
              onClick={handleDownload}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold text-white bg-emerald-800 hover:bg-emerald-900 rounded-lg shadow-xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download {exportFormat.toUpperCase()} File</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
