// import React from "react";

const AppContext: {
    userName: string,
    userFullName: string,
    backend_url: string,
    backend_point_select?: string,
    backend_point_insert?: string,
    backend_point_update?: string,
    backend_point_create_temp?: string,
    backend_point_query?: string,
    backend_point_echo?: string,
} = { backend_url: 'localhost', userName: 'noname', userFullName: 'noname'}

export default AppContext;