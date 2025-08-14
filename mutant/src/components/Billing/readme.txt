Компонент монтируется
        │
        ▼
  useApiState(apiFunc, deps)
        │
        ├─► useState → создаёт:
        │     data = null
        │     error = null
        │     loading = true
        │
        ▼
  useEffect запускается
        │
        ├─► Создаётся AbortController (signal)
        │
        ├─► cancelled = false
        │
        ├─► Запускается async-функция:
        │       loading = true
        │       try {
        │         result = await apiFunc({ signal })
        │         if (!cancelled) {
        │             data = result
        │             error = null
        │         }
        │       } catch (err) {
        │         if (!cancelled && err.name !== "AbortError") {
        │             error = err
        │         }
        │       } finally {
        │         if (!cancelled) loading = false
        │       }
        │
        ▼
Компонент размонтируется или deps меняются
        │
        ├─► cancelled = true
        └─► controller.abort()
