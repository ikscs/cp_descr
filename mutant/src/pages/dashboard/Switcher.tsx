// import React, { useEffect, useState } from "react";
import { useFetch } from "../../hooks/useFetch";
// import DashboardView from "./DashboardBtView_copy";
import DashboardView from "./DashboardBtView";
import PointList from "../../components/Points/PointList";
import { Point } from "../../api/data/pointApi";
import axios from "axios";

// const Switcher_old: React.FC = () => {
//     const [data,setData] = useState<Point[]>([]); 
//     useEffect(() => {
//         const fetchData = async () => {
//             const res = await axios.get(`point/`);
//             setData(res.data);
//         };
//         fetchData();
//     }, []);
                
//     return data.length > 0  ? <DashboardView /> : <PointList />;
// };

// todo: use regular 'getPoints'
const getPoints = async () => {
    const res = await axios.get(`point/`);
    return res.data;
};

const Switcher: React.FC = () => {
    const { data, loading, error } = useFetch<Point[]>(getPoints, []);

    if (loading) return <div>Loading Points...</div>;

    if (error) return <div>Error: {error.message}</div>;
                
    return data.length > 0  ? <DashboardView /> : <PointList />;
};

export default Switcher;