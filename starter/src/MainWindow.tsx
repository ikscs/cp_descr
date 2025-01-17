import { useEffect, useState } from "react"
import { CookiesProvider, useCookies } from 'react-cookie'
import './components/footer.css'
import Footer from "./components/Footer"
import Combo from "./components/combo"
import { /*getCount,*/ getData, } from './api/dataTools'
import AppContext from "./AppContext"
import { treeToJson, getTreeData, onTreeSelect, } from "./tools/treetools"
import MultiSelectCheckbox from "./components/MultiSelectCheckbox"
import { fetchData } from "./api/fetchData"
import Grid from "./components/grid"
// import DataInputBox from "./components/inputbox.jsx"

interface ValueLabel {
    value: Object,
    label: string,
}

const emptyTree = treeToJson([], 'product_group', 'product_group')

const S = () => (<div style={{width: '20px'}}/>)

const H4 = (props: any) => (<h4 style={{margin: 8}}>{props.text}</h4>)

const MainWindow = () => {
    const [cookies, setCookie] = useCookies(['user','userFullName'])
    const [footerText, setFooterText] = useState('') 
    const [userOptions, setUserOptions] = useState<ValueLabel[]>([]);
    const [roleOptions, setRoleOptions] = useState<ValueLabel[]>([]);
    const [subjectOptions, setSubjectOptions] = useState<ValueLabel[]>([]);
    const [user, setUser] = useState('') 
    const [subr, setSubr] = useState(-1);
    const [subj, setSubj] = useState('Unknown');
    const [treeData, setTreeData] = useState(emptyTree)
    const [gridCols, setGridCols] = useState<any[]>([]);
    const [gridRows, setGridRows] = useState<[]>([]);
    const [manufFilter, setManufFilter] = useState('');
    const [textareaValue, setTextareaValue] = useState('');
    
    console.log(user)
    const init = async () => {
        
        // const permCount = await getCount({
        //     from: 'cp3.perm_data',
        //     where: {user_name: 'alavr'}
        // })
        // alert(permCount)

        setUserOptions(await getData({
            from: 'cp3.perm_user', 
            fields: 'user_name,user_full_name',
            order: 'user_full_name',
        }, 'user_name','user_full_name'))
        
        setUser(cookies.user)

        setRoleOptions(await getData({
            from: 'cp3.cp_subject_role', 
            fields: 'subject_role,description',
            order: 'subject_role',
        }, 'subject_role','description'))
        setSubr(2)
    }
    
    const initSubjects = async (subr: number) => {
        setSubjectOptions(await getData({
            from: 'cp3.cp_subject', 
            fields: 'subject_id,name',
            order: 'subject_id',
            where: { subject_role: subr}
        }, 'subject_id','name'))
    }

    const initTreeData = async (subr: number, subj: string) => {
        const rows = await getTreeData(subr, subj)
        setTreeData(treeToJson(rows, 'product_group', 'parent_group'))
    }
    
    const initGridProd = async () => {
        const cols = ['product_id', 'manuf', 'article', 'qtty', 'price_sell', 'name', 'subject_role', 'subject_id',]
        const andManufFilter = manufFilter ? `AND manuf ilike ''%${manufFilter}%''` : ``
        const query = 
    `
    SELECT ${cols.join(',')}
    FROM cp3.vcp_product_org JOIN temp_cp_group USING (subject_role, subject_id, product_group)
    WHERE product_exists AND qtty > 0 ${andManufFilter}
    LIMIT 1000
    `
        setTextareaValue(query)
        const fetchParam = {
            backend_point: AppContext.backend_point_query,
            user: AppContext.userName,
            restore: ['temp_cp_group'],
            query: query,
        }
        setGridCols(cols.map(col => ({key: col, name: col, }))) // width: 5, 
        const data = await fetchData(fetchParam)
        setGridRows(data[0]?.data)
    }
    
    const rowKeyGetter = (row: any) => {
        return row.subject_role +'/'+ row.subject_id +'/'+row.product_id
    }
    const onInput = (e:any) => {
        setManufFilter(e.target.value)
    }

    const clearAll = () => {
        setManufFilter('')
        setGridCols([])
        setGridRows([])
        setTextareaValue('')
    }

    useEffect(() => {
        init()
    }, [])

    return (
        <CookiesProvider>
            <div className='flexbox-container'>
                <H4 text='Рабочее'/>
                <Combo
                    placeholder='No User'
                    options={userOptions}
                    defaultChoice={{value: cookies.user, label: cookies.userFullName}}
                    onChange={({value,label}) => {
                        setFooterText(label)
                        setUser(value)
                        setCookie('user', value, { path: '/' })
                        setCookie('userFullName', label, { path: '/' })
                        AppContext.userName = value
                    }}
                />
                <S/>
                <Combo
                    placeholder="Role"
                    options={roleOptions}
                    onChange={({value,label}) => {
                        setFooterText(label)
                        setSubr(value)
                        initSubjects(value)
                    }}
                />
                <S/>
                <Combo
                    placeholder="Subject"
                    options={subjectOptions}
                    onChange={({value,label}) => {
                        setFooterText(label)
                        setSubj(value)
                        initTreeData(subr,value)
                    }}
                />
                <S/>
                <input 
                    type="text" 
                    size={10}
                    placeholder="manuf"
                    value={manufFilter}
                    onChange={(val)=>{ onInput(val) }}/>
                {/* <DataInputBox/> */}
                <button onClick={clearAll}>Очистить</button>
                <button onClick={initGridProd}>Применить</button>
                <button onClick={initGridProd}>Action 3</button>
            </div> 
            
            <div className='flexbox-container2'>
                <div style={{width: '300px'}}>
                    <MultiSelectCheckbox 
                        data={treeData}
                        onSelect={(items: any) => onTreeSelect(items, subr, subj )}
                    />
                </div>
                
                <div style={{width: '100%', height: '100%', }}>
                    <Grid
                        cols={gridCols}
                        rows={gridRows}
                        rowKeyGetter={rowKeyGetter}
                    />
                </div>
            </div>
            <textarea 
                id='textarea'
                value={textareaValue}
                style={{width:600, height:200, }} 
            />
            <Footer text={footerText}>
            </Footer>

        </CookiesProvider>
    )
}

export default MainWindow