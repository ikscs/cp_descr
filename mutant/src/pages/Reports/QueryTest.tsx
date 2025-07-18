// QueryTest.tsx
import React, { useState, useEffect, useMemo } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  CircularProgress,
  Alert,
  Typography,
  DialogActions,
} from "@mui/material";
import type {
  ChartData,
  ParsedReport,
  ReportExecutionResult,
} from "../Reports/ReportList";
import type { ReportDescriptor } from "./QueryEdit";
// import { fetchData, getBackend } from "../../api/data/fetchData";
// import packageJson from "../../../package.json";
import ReportResult from "./ReportResult"; // ReportResult IS a Dialog
import QueryParam from "./QueryParam"; // QueryParam is NOT a Dialog (it's content)
import LineChart from "../Charts/LineChart"; // LineChart is NOT a Dialog (it's content)
import CircularChart from "../Charts/CircularChart"; // <-- 1. Import CircularChart
import { useCustomer } from "../../context/CustomerContext";
import { executeReportQuery } from "../../api/data/reportToolsDrf";
// import { get } from 'http';

// const backend = getBackend();

// Helper function to convert ReportDescriptor to ParsedReport
const MakeParsedReport = (reportData: ReportDescriptor): ParsedReport => {
  const config = reportData.report_config || {};
  const params = config.params || [];
  const columns = config.columns || [];
  const chart = config.chart;

  // Ensure chart type has a default if chart exists but type doesn't
  if (chart && !chart.type) {
    chart.type = "linear"; // Default to linear
  }

  return {
    id: reportData.report_id,
    name: reportData.report_name,
    description: reportData.report_description,
    query: reportData.query,
    config: {
      params: params.map((param) => ({
        name: param.name,
        description: param.description,
        type: param.type,
        notNull: param.notNull,
        defaultValue:
          param.type === "boolean"
            ? false
            : param.type === "number"
            ? 0
            : // db_select will also default to '' initially
              "",
        optionsQuery: param.optionsQuery, // <--- ДОБАВЛЕНО: Передача optionsQuery
        selectOptions: param.selectOptions || [],
      })),
      columns: columns.map((col) => ({
        field: col.field,
        width: col.width,
      })),
      // Ensure chart is an object with a type
      chart: typeof chart === "object" && chart?.type ? chart : undefined,
    },
  };
};

interface QueryTestProps {
  _reportData: ReportDescriptor;
  open: boolean; // Controls overall visibility from parent
  onClose: () => void; // Function to call when QueryTest should close
}

const QueryTest: React.FC<QueryTestProps> = ({
  _reportData,
  open,
  onClose,
}) => {
  // State for internal logic
  const [executionResult, setExecutionResult] =
    useState<ReportExecutionResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [currentView, setCurrentView] = useState<
    "idle" | "params" | "executing" | "results" | "chart" | "error"
  >("idle");
  const [queryParams, setQueryParams] = useState<
    { name: string; value: string | number | boolean }[]
  >([]);
  const [reportData, setReportData] = useState<ParsedReport>(
    MakeParsedReport(_reportData)
  );
  const [chartData, setChartData] = useState<ChartData | null>(null);
  const [chartType, setChartType] = useState<"linear" | "circular" | null>(
    null
  ); // <-- 2. Add state for chart type
  const [lastShowAsChartPreference, setLastShowAsChartPreference] =
    useState<boolean>(false);

  const { customerData: rawCustomerData } = useCustomer(); // Renamed to avoid confusion

  // Transform rawCustomerData to the shape expected by QueryParam's reportContext
  const reportContextValue = useMemo(() => {
    if (!rawCustomerData) {
      // rawCustomerData is of type { customer?: number; point_id?: number; } | null
      return undefined;
    }

    const context: { [key: string]: number | null | undefined } = {};

    if (rawCustomerData.customer !== undefined) {
      context.customer = rawCustomerData.customer; // Assign if present; number | undefined is compatible
    }
    if (rawCustomerData.point_id !== undefined) {
      context.point_id = rawCustomerData.point_id; // Assign if present
    }

    return context;
  }, [rawCustomerData]);

  // Update parsed report data when input changes
  useEffect(() => {
    setReportData(MakeParsedReport(_reportData));
  }, [_reportData]);

  // Effect to manage state transitions when 'open' prop changes
  useEffect(() => {
    if (open) {
      // Reset internal state when dialog is opened
      setExecutionResult(null);
      setError(null);
      setChartData(null);
      setChartType(null); // Reset chart type
      setLastShowAsChartPreference(false); // Reset preference on new dialog open

      // Determine initial view: params or execute directly
      const hasParams =
        reportData.config?.params && reportData.config.params.length > 0;
      if (hasParams) {
        // Initialize queryParams state with default values from the current reportData
        setQueryParams(
          (reportData.config.params || []).map((p) => ({
            name: p.name,
            value: p.defaultValue, // defaultValue уже корректно типизирован в ParsedReport
          }))
        );
        setCurrentView("params");
      } else {
        executeReport([]); // Execute immediately if no params
      }
    } else {
      // Reset view when dialog is closed externally
      setCurrentView("idle");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]); // Rerun only when 'open' changes

  // Effect to update reportData state without triggering initial execution logic again
  useEffect(() => {
    setReportData(MakeParsedReport(_reportData));
  }, [_reportData]);
  /*
  // --- Data Fetching ---
  const executeReportQuery_ = async (
    id: number,
    params: { name: string; value: string | number | boolean }[]
  ): Promise<ReportExecutionResult> => {
    // ... (keep existing executeReportQuery implementation)
    try {
      const paramsToSend = {
        backend_point: backend.backend_point_report,
        app_id: packageJson.name,
        report_id: id,
        parameters: params,
      };

      const response: any = await fetchData(paramsToSend);

      if (!response) {
        throw new Error("No response received from backend.");
      }

      // Check if response indicates an error (e.g., !response.ok, status >= 400)
      // Adapt this based on your actual fetchData structure and how errors are returned
      const isErrorStatus =
        response.ok === false || (response.status && response.status >= 400);
      const responseData = response.data || response; // Adjust based on where data/error is

      if (isErrorStatus) {
        // Try to get a meaningful error message
        const errorMsg =
          response.error || // If backend sends { error: '...' }
          response.message || // If backend sends { message: '...' }
          (typeof responseData === "string" ? responseData : null) || // If error is just a string response
          response.statusText || // Standard HTTP status text
          `HTTP error ${response.status || "unknown"}`;
        // Return error structure instead of throwing to show in table/alert
        return { columns: ["Ошибка"], rows: [[`Ошибка бэкенда: ${errorMsg}`]] };
        // throw new Error(`Backend error: ${errorMsg}`);
      }

      if (
        !responseData ||
        (Array.isArray(responseData) && responseData.length === 0)
      ) {
        return { columns: ["Сообщение"], rows: [["Нет данных"]] };
      }

      // Basic check for valid data structure (array of objects)
      if (
        !Array.isArray(responseData) ||
        responseData.length === 0 ||
        typeof responseData[0] !== "object" ||
        responseData[0] === null
      ) {
        // Consider logging the actual responseData structure here for debugging
        console.warn(
          "Received unexpected data format from backend:",
          responseData
        );
        return {
          columns: ["Сообщение"],
          rows: [["Некорректный формат данных в ответе"]],
        };
      }

      const columns = Object.keys(responseData[0]);
      const rows = responseData.map((row: any) =>
        columns.map((col) => row[col])
      );
      return { columns, rows };
    } catch (err: any) {
      console.error("Error in executeReportQuery:", err);
      // Return error structure
      return {
        columns: ["Ошибка"],
        rows: [
          [`Ошибка запроса данных: ${err.message || "Неизвестная ошибка"}`],
        ],
      };
      // throw new Error(`Failed to fetch or process report data: ${err.message || err}`);
    }
  };
*/
  // --- Core Execution Logic ---
  const executeReport = async (
    params: { name: string; value: string | number | boolean }[],
    showAsChart?: boolean
  ) => {
    setCurrentView("executing"); // Show loading state
    setExecutionResult(null);
    setError(null);
    setChartData(null);
    setChartType(null);

    try {
      // Ensure reportData is available before accessing id
      if (!reportData) {
        throw new Error("Report data is not available.");
      }
      const result = await executeReportQuery(reportData.id, params);
      setExecutionResult(result);

      // Check if the result itself is an error message from the backend
      const isErrorResult =
        result.columns.length === 1 &&
        (result.columns[0] === "Ошибка" || result.columns[0] === "Сообщение");
      if (isErrorResult && result.columns[0] === "Ошибка") {
        setError(result.rows[0]?.[0] || "Неизвестная ошибка выполнения");
        setCurrentView("error"); // Show error view
      } else if (showAsChart && reportData.config?.chart && !isErrorResult) {
        // If showAsChart is true, report has chart config, and no direct error from query
        handleOpenChartDialog(result); // Pass the fresh result
      } else {
        setCurrentView("results"); // Show results view on success or 'Сообщение' (if not showing chart directly)
      }
    } catch (err: any) {
      // Catch errors from executeReportQuery if it throws (e.g., network error)
      console.error("Error executing report:", err);
      const errorMessage =
        err.message || "Неизвестная ошибка при выполнении отчета";
      setError(`Ошибка при выполнении отчета: ${errorMessage}`);
      // Optionally set a minimal executionResult for the error dialog
      setExecutionResult({ columns: ["Ошибка"], rows: [[errorMessage]] });
      setCurrentView("error"); // Show error view on failure
    }
  };

  // --- Event Handlers ---

  // Close the entire QueryTest component
  const handleClose = () => {
    setCurrentView("idle"); // Reset internal state
    onClose(); // Call parent's close handler
  };

  // Close parameter view and trigger main close
  const handleParamDialogClose = () => {
    handleClose();
  };

  // Execute from parameters view
  const handleExecuteWithParams = async (
    params: { name: string; value: string | number | boolean }[],
    showAsChart: boolean
  ) => {
    setQueryParams(params); // Store params in case user goes back
    setLastShowAsChartPreference(showAsChart); // Store the preference
    await executeReport(params, showAsChart); // Pass showAsChart to execution logic
  };

  // Close results view and trigger main close
  const handleResultDialogClose = () => {
    handleClose();
  };

  // Go back to parameters view from results/chart/error
  const handleReopenParamDialog = () => {
    // Reset results/chart/error states before going back
    setExecutionResult(null);
    setChartData(null);
    setChartType(null);
    setError(null);
    // queryParams should still hold the last used parameters
    setCurrentView("params");
  };

  // <-- 3. Update handleOpenChartDialog -->
  const handleOpenChartDialog = (
    currentExecutionResult: ReportExecutionResult
  ) => {
    setError(null); // Clear previous UI errors
    // Используем переданный currentExecutionResult вместо состояния executionResult
    if (currentExecutionResult && reportData) {
      // Check if the execution result itself indicates an error or just a message
      if (
        currentExecutionResult.columns.length === 1 &&
        (currentExecutionResult.columns[0] === "Ошибка" ||
          currentExecutionResult.columns[0] === "Сообщение")
      ) {
        setError(
          "Невозможно построить график по сообщению об ошибке или отсутствию данных."
        );
        setCurrentView("error"); // Switch to error view
        return;
      }

      const config = reportData.config;
      const chartConfig = config?.chart;

      // Ensure chart config is complete
      if (
        !chartConfig ||
        !chartConfig.type || // Make sure type is defined
        !chartConfig.x_axis?.field ||
        !chartConfig.body_fields ||
        chartConfig.body_fields.length === 0
      ) {
        setError(
          "Конфигурация графика (тип, оси X, поля данных) не задана или неполная."
        );
        setCurrentView("error");
        return;
      }

      const xAxisField = chartConfig.x_axis.field;
      const yAxisValueFields = chartConfig.body_fields;
      // Use y_axis.field for labels if available and split by comma, otherwise fallback to body_fields
      const yAxisLabels =
        chartConfig.y_axis?.field
          ?.split(",")
          .map((s) => s.trim())
          .filter(Boolean) || yAxisValueFields;
      const yAxisTitleLabel = chartConfig.y_axis_label;

      const xAxisIndex = currentExecutionResult.columns.indexOf(xAxisField);
      const yAxisIndices = yAxisValueFields.map((field) =>
        currentExecutionResult.columns.indexOf(field)
      );

      // Validate indices
      if (xAxisIndex === -1) {
        setError(`Поле для оси X '${xAxisField}' не найдено в результатах.`);
        setCurrentView("error");
        return;
      }
      // For circular, we only strictly need the first Y field index
      if (chartConfig.type === "circular" && yAxisIndices[0] === -1) {
        setError(
          `Поле для данных '${yAxisValueFields[0]}' не найдено в результатах.`
        );
        setCurrentView("error");
        return;
      }
      // For linear, check all Y field indices
      if (
        chartConfig.type !== "circular" &&
        yAxisIndices.some((index) => index === -1)
      ) {
        const missing = yAxisValueFields.filter(
          (_, i) => yAxisIndices[i] === -1
        );
        setError(
          `Одно или несколько полей для данных (${missing.join(
            ", "
          )}) не найдены в результатах.`
        );
        setCurrentView("error");
        return;
      }

      // Process data based on chart type
      try {
        let processedChartData: ChartData | null = null;
        let determinedChartType: "linear" | "circular" | null = null;

        if (chartConfig.type === "circular") {
          // --- Circular Chart Data Preparation ---
          if (yAxisIndices.length > 1) {
            console.warn(
              "Circular chart config has multiple body_fields. Using the first one:",
              yAxisValueFields[0]
            );
          }

          const segmentLabels = currentExecutionResult.rows.map(
            (row) => row[xAxisIndex]?.toString() ?? ""
          );
          const segmentValues = currentExecutionResult.rows.map((row) => {
            const value = row[yAxisIndices[0]]; // Use first Y field
            if (value === null || value === undefined) return 0; // Default to 0 for circular
            const num = Number(value);
            return !isNaN(num) ? num : 0; // Default to 0 if conversion fails
          });
          // Use the first label from y_axis.field if available, otherwise the first body_field name
          const datasetLabel = yAxisLabels[0] || yAxisValueFields[0];

          processedChartData = {
            xAxisValues: segmentLabels, // Segment labels
            datasets: [{ label: datasetLabel, data: segmentValues }], // Single dataset
          };
          determinedChartType = "circular";
        } else {
          // Default to linear or handle other types like 'linear' explicitly
          // --- Linear Chart Data Preparation (Existing Logic) ---
          const xAxisValues = currentExecutionResult.rows.map(
            (row) => row[xAxisIndex]?.toString() ?? ""
          );
          const datasets = yAxisIndices.map((yAxisIndex, index) => ({
            // Use corresponding label from y_axis.field or fallback to body_field name
            label: yAxisLabels[index] || yAxisValueFields[index],
            data: currentExecutionResult.rows.map((row) => {
              const value = row[yAxisIndex];
              if (value === null || value === undefined) return null;
              const num = Number(value);
              return !isNaN(num) ? num : null;
            }),
          }));
          processedChartData = {
            xAxisValues,
            datasets,
            yAxisLabel: yAxisTitleLabel,
          };
          determinedChartType = "linear"; // Assume linear if not circular
        }

        // Set data and open dialog if processing was successful
        if (processedChartData && determinedChartType) {
          setChartData(processedChartData);
          setChartType(determinedChartType);
          setCurrentView("chart"); // Switch to chart view
        } else {
          setError("Не удалось обработать данные для графика.");
          setCurrentView("error");
        }
      } catch (processError: any) {
        console.error("Error processing data for chart:", processError);
        setError(
          `Ошибка при обработке данных для графика: ${processError.message}`
        );
        setCurrentView("error");
      }
    } else {
      setError(
        "Нет данных для построения графика (результат выполнения отсутствует или отчет не выбран)."
      );
      setCurrentView("error");
    }
  };

  // Close chart view and trigger main close
  const handleCloseChartDialog = () => {
    // We might want to go back to results instead of closing entirely?
    // For now, keep original behavior: close the whole test dialog.
    handleClose();
    // If we wanted to go back to results:
    // setChartData(null);
    // setChartType(null);
    // setCurrentView('results');
  };

  // --- Rendering Logic ---

  // Render nothing if the main 'open' prop is false or view is 'idle'
  if (!open || currentView === "idle") {
    return null;
  }

  // Render Loading Dialog
  if (currentView === "executing") {
    return (
      <Dialog
        open={true}
        PaperProps={{
          style: { backgroundColor: "transparent", boxShadow: "none" },
        }}
      >
        <DialogContent style={{ textAlign: "center" }}>
          <CircularProgress />
          <Typography>Выполнение отчета...</Typography>
        </DialogContent>
      </Dialog>
    );
  }

  // Render Parameter Dialog Content
  if (currentView === "params") {
    // Ensure reportData and its config/params are loaded before rendering
    const paramsExist =
      reportData?.config?.params && reportData.config.params.length > 0;
    return (
      <Dialog
        open={true} // Always open when view is 'params' and parent 'open' is true
        onClose={handleParamDialogClose}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>
          Параметры для тестового отчета: {reportData?.name || "Загрузка..."}
        </DialogTitle>
        <DialogContent>
          {reportData && paramsExist ? ( // Check if reportData is loaded and params exist
            <QueryParam
              report={reportData}
              onExecute={handleExecuteWithParams}
              onClose={handleParamDialogClose}
              initialParams={queryParams} // Use stored params if re-opening
              initialShowAsChart={lastShowAsChartPreference} // Pass the stored preference
              reportContext={reportContextValue} // Pass the transformed customer context
            />
          ) : reportData ? ( // reportData loaded but no params
            <Box>
              <Typography sx={{ mb: 2 }}>
                У отчета нет настраиваемых параметров.
              </Typography>
              <Box display="flex" justifyContent="flex-end" gap={2}>
                <Button onClick={handleParamDialogClose}>Отмена</Button>
                {/* Button to execute directly if needed, though it should have happened automatically */}
                <Button variant="contained" onClick={() => executeReport([])}>
                  Выполнить
                </Button>
              </Box>
            </Box>
          ) : (
            // reportData still loading
            <CircularProgress />
          )}
        </DialogContent>
      </Dialog>
    );
  }

  // Render Results Dialog (using ReportResult component which is a Dialog)
  if (currentView === "results" && executionResult && reportData) {
    return (
      <ReportResult
        report={reportData}
        queryParams={queryParams}
        executionResult={executionResult}
        open={true} // ReportResult manages its own visibility via this prop
        onClose={handleResultDialogClose} // Closes the whole test
        chartData={chartData} // Pass chartData (might be null)
        setChartData={setChartData} // Pass setter (might be unused by ReportResult)
        handleOpenChartDialog={() => {
          // Оборачиваем вызов, чтобы передать актуальный executionResult из состояния
          if (executionResult) {
            handleOpenChartDialog(executionResult);
          } else {
            setError(
              "Результаты выполнения отчета отсутствуют для построения графика."
            );
            setCurrentView("error");
          }
        }}
        onReopenParamDialog={handleReopenParamDialog} // Pass handler to switch view to params
      />
    );
  }

  // <-- 4. Update Chart Dialog Rendering -->
  if (currentView === "chart" && chartData && reportData && chartType) {
    // Ensure chartType is also set
    return (
      <Dialog
        open={true} // Always open when view is 'chart'
        onClose={handleCloseChartDialog} // Closes the whole test
        fullWidth
        // Adjust maxWidth based on chart type
        maxWidth={chartType === "circular" ? "md" : "lg"}
      >
        {/* Optional: Title could be here or handled within the chart component */}
        {/* <DialogTitle sx={{ pb: 0 }}>График: {reportData.name}</DialogTitle> */}
        <DialogContent>
          <Box
            sx={{ height: "60vh", minHeight: "400px", position: "relative" }}
          >
            {/* Conditional rendering based on chartType */}
            {chartType === "circular" ? (
              <CircularChart
                reportName={reportData.name || ""}
                labels={chartData.xAxisValues} // For CircularChart these are segment labels
                // Data for CircularChart: usually one dataset with numeric values
                datasets={chartData.datasets.map((ds) => ({
                  label: ds.label, // Dataset label (for legend/tooltips)
                  data: ds.data.map((d) => d ?? 0), // Convert null to 0 for circular chart
                }))}
                onClose={handleCloseChartDialog} // Close the whole test
                onReopenParamDialog={handleReopenParamDialog} // Go back to params
              />
            ) : (
              // Default or if chartType === 'linear'
              <LineChart
                reportName={reportData.name || ""}
                xAxisValues={chartData.xAxisValues} // X-axis values
                datasets={chartData.datasets} // Datasets for lines
                yAxisLabel={chartData.yAxisLabel} // Y-axis label (if any)
                onClose={handleCloseChartDialog} // Close the whole test
                onReopenParamDialog={handleReopenParamDialog} // Go back to params
              />
            )}
          </Box>
        </DialogContent>
        {/* Actions like close/reopen params are handled by the chart component's internal buttons */}
      </Dialog>
    );
  }

  // Render Error Dialog
  if (currentView === "error" && error) {
    const canReopenParams =
      reportData?.config?.params && reportData.config.params.length > 0;
    return (
      <Dialog open={true} onClose={handleClose}>
        {" "}
        {/* Close triggers main onClose */}
        <DialogTitle>Ошибка</DialogTitle>
        <DialogContent>
          <Alert severity="error">{error}</Alert>
        </DialogContent>
        <DialogActions>
          {/* Allow going back to params if applicable */}
          {canReopenParams && (
            <Button onClick={handleReopenParamDialog}>
              Изменить параметры
            </Button>
          )}
          <Button onClick={handleClose}>Закрыть</Button>
        </DialogActions>
      </Dialog>
    );
  }

  // Fallback if state is inconsistent (should not happen with proper view management)
  console.warn("QueryTest reached inconsistent render state:", currentView);
  return null;
};

export default QueryTest;
