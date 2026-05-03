import { Component, inject, computed, input, signal } from '@angular/core';
import { NgxEchartsDirective } from 'ngx-echarts';
import { BudgetStore } from '../../../store/budget.store';
import { EChartsOption } from 'echarts';
import { isPlatformBrowser } from '@angular/common';
import { PLATFORM_ID } from '@angular/core';

type TimeRange = '1M' | '3M' | '6M' | '1Y' | '3Y' | '7Y' | 'ALL';

@Component({
  selector: 'app-savings-chart',
  standalone: true,
  imports: [NgxEchartsDirective],
  templateUrl: './savings-chart.component.html',
})
export class SavingsChartComponent {
  private budgetStore = inject(BudgetStore);
  private platformId = inject(PLATFORM_ID);

  isBrowser = isPlatformBrowser(this.platformId);

  ranges: TimeRange[] = ['1M', '3M', '6M', '1Y', '3Y', '7Y', 'ALL'];
  selectedRange = signal<TimeRange>('ALL');

  filteredData = computed(() => {
    const data = this.budgetStore.chartData();
    const months = data.months;
    if (!months.length) return data;

    const limit = this.getMonthLimit(this.selectedRange());
    if (limit === null) return data;

    const sliced = months.slice(-limit);
    const idx = months.length - sliced.length;

    return {
      months: sliced,
      income: data.income.slice(idx),
      realSavings: data.realSavings.slice(idx),
    };
  });

  chartOptions = computed((): EChartsOption => {
    const data = this.filteredData();
    return {
      backgroundColor: 'transparent',
      grid: { left: 60, right: 20, top: 20, bottom: 40 },
      tooltip: {
        trigger: 'axis',
        backgroundColor: '#1a1a2e',
        borderColor: 'rgba(255,255,255,0.1)',
        textStyle: { color: '#fff', fontSize: 12 },
        formatter: (params: any) => {
          let html = `<div style="margin-bottom:6px;font-weight:600">${params[0].axisValue}</div>`;
          params.forEach((p: any) => {
            html += `<div style="display:flex;align-items:center;gap:8px;margin:2px 0">
              <span style="width:8px;height:8px;border-radius:50%;background:${p.color};display:inline-block"></span>
              <span style="color:rgba(255,255,255,0.6)">${p.seriesName}</span>
              <span style="font-weight:500;margin-left:auto">€${p.value?.toFixed(2) ?? '0.00'}</span>
            </div>`;
          });
          return html;
        }
      },
      xAxis: {
        type: 'category',
        data: data.months,
        axisLine: { lineStyle: { color: 'rgba(255,255,255,0.1)' } },
        axisLabel: { color: 'rgba(255,255,255,0.4)', fontSize: 11 },
        axisTick: { show: false },
      },
      yAxis: {
        type: 'value',
        axisLabel: {
          color: 'rgba(255,255,255,0.4)',
          fontSize: 11,
          formatter: (v: number) => `€${v}`,
        },
        splitLine: { lineStyle: { color: 'rgba(255,255,255,0.05)' } },
        axisLine: { show: false },
      },
      series: [
        {
          name: 'Income',
          type: 'line',
          data: data.income,
          smooth: true,
          symbol: 'circle',
          symbolSize: 6,
          lineStyle: { color: '#34d399', width: 2 },
          itemStyle: { color: '#34d399' },
          areaStyle: {
            color: {
              type: 'linear', x: 0, y: 0, x2: 0, y2: 1,
              colorStops: [
                { offset: 0, color: 'rgba(52,211,153,0.15)' },
                { offset: 1, color: 'rgba(52,211,153,0)' },
              ],
            },
          },
        },
        {
          name: 'Real savings',
          type: 'line',
          data: data.realSavings,
          smooth: true,
          symbol: 'circle',
          symbolSize: 6,
          lineStyle: { color: '#a78bfa', width: 2 },
          itemStyle: { color: '#a78bfa' },
          areaStyle: {
            color: {
              type: 'linear', x: 0, y: 0, x2: 0, y2: 1,
              colorStops: [
                { offset: 0, color: 'rgba(167,139,250,0.15)' },
                { offset: 1, color: 'rgba(167,139,250,0)' },
              ],
            },
          },
        },
      ],
      legend: {
        bottom: 0,
        textStyle: { color: 'rgba(255,255,255,0.5)', fontSize: 12 },
        icon: 'circle',
        itemWidth: 8,
        itemHeight: 8,
      },
    };
  });

  selectRange(range: TimeRange): void {
    this.selectedRange.set(range);
  }

  private getMonthLimit(range: TimeRange): number | null {
    const map: Record<TimeRange, number | null> = {
      '1M': 1, '3M': 3, '6M': 6,
      '1Y': 12, '3Y': 36, '7Y': 84,
      'ALL': null,
    };
    return map[range];
  }
}