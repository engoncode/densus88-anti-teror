import { ApexOptions } from 'apexcharts';

/**
 * Get theme-aware base chart options for ApexCharts
 * This ensures chart labels and grid lines are visible in both light and dark mode
 */
export const getChartThemeOptions = (isDarkMode: boolean): Partial<ApexOptions> => {
  return {
    chart: {
      foreColor: isDarkMode ? '#FFFFFF' : '#1F2937',
      background: 'transparent',
    },
    tooltip: {
      theme: isDarkMode ? 'dark' : 'light',
    },
    grid: {
      borderColor: isDarkMode ? '#4B5563' : '#E5E7EB',
    },
    xaxis: {
      labels: {
        style: {
          colors: isDarkMode ? '#FFFFFF' : '#1F2937',
        },
      },
    },
    yaxis: {
      labels: {
        style: {
          colors: isDarkMode ? '#FFFFFF' : '#1F2937',
        },
      },
    },
    legend: {
      labels: {
        colors: isDarkMode ? '#FFFFFF' : '#1F2937',
      },
    },
  };
};

/**
 * Merge theme options with custom chart options
 */
export const mergeChartOptions = (isDarkMode: boolean, customOptions: ApexOptions): ApexOptions => {
  const themeOptions = getChartThemeOptions(isDarkMode);

  return {
    ...customOptions,
    chart: {
      ...themeOptions.chart,
      ...customOptions.chart,
    },
    ...(customOptions.fill ? { fill: { ...customOptions.fill } } : {}),
    ...(customOptions.stroke ? { stroke: { ...customOptions.stroke } } : {}),
    ...(customOptions.markers ? { markers: { ...customOptions.markers } } : {}),
    grid: {
      ...themeOptions.grid,
      ...customOptions.grid,
    },
    xaxis: {
      ...customOptions.xaxis,
      labels: {
        ...customOptions.xaxis?.labels,
        style: {
          ...themeOptions.xaxis?.labels?.style,
          ...customOptions.xaxis?.labels?.style,
        },
      },
    },
    yaxis: {
      ...(Array.isArray(customOptions.yaxis) ? {} : customOptions.yaxis),
      labels: {
        ...(Array.isArray(customOptions.yaxis) || !customOptions.yaxis?.labels
          ? {}
          : customOptions.yaxis.labels),
        style: {
          ...(themeOptions.yaxis && !Array.isArray(themeOptions.yaxis)
            ? themeOptions.yaxis.labels?.style
            : {}),
          ...(Array.isArray(customOptions.yaxis) || !customOptions.yaxis?.labels?.style
            ? {}
            : customOptions.yaxis.labels.style),
        },
      },
    },
    legend: {
      ...customOptions.legend,
      labels: {
        ...customOptions.legend?.labels,
        colors: themeOptions.legend?.labels?.colors,
      },
    },
    tooltip: {
      ...themeOptions.tooltip,
      ...customOptions.tooltip,
    },
  };
};
