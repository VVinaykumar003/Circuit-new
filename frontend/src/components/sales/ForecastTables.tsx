import React from 'react';
import {Card}  from './ForecastWidgets';
import { formatCurrency, formatPercent } from './ForecastUtils';
import type { RegionData, RepData, Opportunity } from '../../type/salesForecast';

export const RegionalTable = ({ data }: { data: RegionData[] }) => (
  <Card title="Regional Forecast Analytics" className="overflow-hidden">
    <div className="overflow-x-auto w-full">
      <table className="table table-zebra w-full">
        <thead>
          <tr className="text-base-content bg-base-200">
            <th>Region</th>
            <th>Revenue Forecast</th>
            <th>Pipeline Value</th>
            <th>Target</th>
            <th>Achievement %</th>
            <th>Top Sales Rep</th>
          </tr>
        </thead>
        <tbody>
          {data.map((row, i) => (
            <tr key={i} className="hover">
              <td className="font-bold">{row.region}</td>
              <td className="text-primary font-semibold">{formatCurrency(row.forecast)}</td>
              <td>{formatCurrency(row.pipeline)}</td>
              <td>{formatCurrency(row.target)}</td>
              <td>
                <div className="flex items-center gap-2">
                  <progress className={`progress w-16 ${row.achievement >= 100 ? 'progress-success' : 'progress-warning'}`} value={row.achievement} max="100"></progress>
                  <span className="text-xs font-semibold">{formatPercent(row.achievement)}</span>
                </div>
              </td>
              <td><span className="badge badge-ghost badge-sm">{row.topRep}</span></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </Card>
);

export const RepPerformanceTable = ({ data }: { data: RepData[] }) => (
  <Card title="Sales Representative Performance" className="overflow-hidden">
    <div className="overflow-x-auto w-full">
      <table className="table w-full">
        <thead>
          <tr className="text-base-content bg-base-200">
            <th>Representative</th>
            <th>Revenue Forecast</th>
            <th>Closed Revenue</th>
            <th>Target</th>
            <th>Achievement %</th>
            <th>Pipeline Value</th>
            <th>Win Rate</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {data.map((rep, i) => {
            const achievement = rep.target > 0 ? (rep.closed / rep.target) * 100 : 0;
            return (
              <tr key={i} className="hover">
                <td>
                  <div className="flex items-center gap-3">
                    <div className="avatar placeholder"><div className="bg-neutral-focus text-neutral-content rounded-full w-8"><span className="text-xs">{rep.name.charAt(0)}</span></div></div>
                    <div className="font-bold">{rep.name}</div>
                  </div>
                </td>
                <td>{formatCurrency(rep.forecast)}</td>
                <td>{formatCurrency(rep.closed)}</td>
                <td>{formatCurrency(rep.target)}</td>
                <td>
                  <div className="flex items-center gap-2">
                    <progress className={`progress w-16 ${achievement >= 100 ? 'progress-success' : 'progress-warning'}`} value={achievement} max="100"></progress>
                    <span className="text-xs font-semibold">{formatPercent(achievement)}</span>
                  </div>
                </td>
                <td>{formatCurrency(rep.pipeline)}</td>
                <td>{formatPercent(rep.winRate)}</td>
                <td>
                  <span className={`badge badge-sm ${rep.status === 'Exceeded' ? 'badge-success' : rep.status === 'At Risk' ? 'badge-error' : 'badge-info'}`}>
                    {rep.status}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  </Card>
);

export const FullForecastTable = ({ data }: { data: Opportunity[] }) => (
  <Card title="Detailed Forecast Opportunities" className="overflow-hidden">
    <div className="overflow-x-auto w-full">
      <table className="table table-zebra table-sm w-full">
        <thead>
          <tr className="bg-base-200 text-base-content">
            <th>Opportunity</th>
            <th>Customer</th>
            <th>Sales Rep</th>
            <th>Region</th>
            <th>Deal Value</th>
            <th>Probability</th>
            <th>Expected Rev</th>
            <th>Expected Close Date</th>
            <th>Stage</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {data.map((opp, i) => (
            <tr key={i} className="hover">
              <td className="font-semibold">{opp.name}</td>
              <td>{opp.customer}</td>
              <td>{opp.rep}</td>
              <td>{opp.region}</td>
              <td className="font-semibold text-primary">{formatCurrency(opp.value)}</td>
              <td>{formatPercent(opp.probability)}</td>
              <td className="font-semibold">{formatCurrency(opp.expectedRevenue)}</td>
              <td>{new Date(opp.expectedCloseDate).toLocaleDateString()}</td>
              <td><span className="badge badge-outline badge-sm">{opp.stage}</span></td>
              <td><span className={`badge badge-sm ${opp.status === 'Won' ? 'badge-success' : opp.status === 'Lost' ? 'badge-error' : 'badge-ghost'}`}>{opp.status}</span></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </Card>
);