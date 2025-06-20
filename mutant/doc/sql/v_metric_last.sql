CREATE VIEW v_metric_last  AS
SELECT * 
FROM metric m JOIN metric_history h ON m.id = h.metric_id
WHERE h.collected_at = (
	SELECT max(collected_at) 
	FROM metric_history h1 
	WHERE m.id = h1.metric_id )
ORDER BY group_name, sortord, metric_name

