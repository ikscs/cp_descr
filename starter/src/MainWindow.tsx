import { useEffect, useState } from "react"
import { CookiesProvider, useCookies } from 'react-cookie'
import './components/footer.css'
import Footer from "./components/Footer"
import Combo from "./components/combo"
import { /*getCount,*/ getData, } from './api/dataTools'
import AppContext from "./AppContext"
import { treeToJson, getTreeData, putTreeSelected, } from "./tools/treetools"
import MultiSelectCheckbox from "./components/MultiSelectCheckbox"
import { fetchData } from "./api/fetchData"
import Grid from "./components/grid"
import Checkbox from "./components/checkbox"
import packageJson from '../package.json';
// import DataInputBox from "./components/inputbox.jsx"

interface ValueLabel {
    value: Object,
    label: string,
}

interface ILang {
    ua?: boolean,
    en?: boolean,
    ru?: boolean,
}

const emptyTree = treeToJson([], 'product_group', 'product_group')

const S = () => (<div style={{width: '20px'}}/>)

const H4 = (props: any) => (<h4 style={{margin: 8}}>{props.text}</h4>)

const MainWindow = () => {
    const [cookies, setCookie] = useCookies(['user','userFullName','descrState','descrStateName'])
    const [footerText, setFooterText] = useState('') 
    const [userOptions, setUserOptions] = useState<ValueLabel[]>([]);
    const [roleOptions, setRoleOptions] = useState<ValueLabel[]>([]);
    const [subjectOptions, setSubjectOptions] = useState<ValueLabel[]>([]);
    const [descrStateOptions, setDescrStateOptions] = useState<ValueLabel[]>([]);
    const [user, setUser] = useState('') 
    const [subr, setSubr] = useState(-1);
    const [subj, setSubj] = useState('Unknown');
    const [descrState, setDescrState] = useState(null);
    const [langState, setLangState] = useState<ILang>({ua: true,});
    const [treeData, setTreeData] = useState(emptyTree)
    const [treeSelected, setTreeSelected] = useState([])
    const [gridCols, setGridCols] = useState<any[]>([]);
    const [gridRows, setGridRows] = useState<[]>([]);
    const [gridLimit, setGridLimit] = useState(1000);
    const [manufFilter, setManufFilter] = useState('');
    const [descriptionFilter, setDescriptionFilter] = useState('');
    const [footerColor, setFooterColor] = useState('navy');
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
            // fields: 'subject_role,description',
            fields: 'subject_role, subject_role||\'\'-\'\'||description AS description',
            order: 'subject_role',
        }, 'subject_role','description'))
        setSubr(2)

        const data = await getData({
            from: 'translate.descr_state', 
            fields: 'descr_state, descr_state||\'\'-\'\'||description AS description',
            order: 'descr_state',
        }, 'descr_state','description')
        data.push({value: -1, label: 'Любой'})
        setDescrStateOptions(data.sort((a:any,b:any)=>a.value-b.value))
        setDescrState(cookies.descrState)
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
    
    const longExec = async (f: Function) => {
        setFooterColor('darkmagenta')
        await f()
        setFooterColor('navy')
    }
    // const longExecStart = () => setFooterColor('darkmagenta')
    // const longExecStop = () => setFooterColor('navy')

    const initGridProd = async () => {
        await longExec(async() => {

        await putTreeSelected(treeSelected, subr, subj)

        //setFooterColor('darkmagenta')
        const cols = ['product_id', 'manuf', 'article', 'qtty', 'price_sell', 'name', 'subject_role', 'subject_id',]
        const andManufFilter = manufFilter ? `AND manuf ilike ''%${manufFilter}%''` : ``
        const andDescrState = descrState ? 'AND 1=1' : ''
        const query = 
    `
    SELECT ${cols.join(',')}
    FROM cp3.vcp_product_org JOIN temp_cp_group USING (subject_role, subject_id, product_group)
    WHERE product_exists AND qtty > 0 ${andManufFilter} ${andDescrState}
    ${gridLimit ? 'LIMIT ' + gridLimit : '' }
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
        // setFooterColor('navy')
        })
    }
    
    // const onTreeSelect = async (items: any) => {
    //     longExecStart
    //     await putTreeSelected(items, subr, subj )
    //     longExecStop
    // }

    const rowKeyGetter = (row: any) => {
        return row.subject_role +'/'+ row.subject_id +'/'+row.product_id
    }
    const onManufFilterInput = (e:any) => {
        setManufFilter(e.target.value)
    }
    const onDescriptionFilterInput = (e:any) => {
        setDescriptionFilter(e.target.value)
    }

    const clearAll = () => {
        setManufFilter('')
        setGridCols([])
        setGridRows([])
        setTextareaValue('')
        // todo: setTreeSelected([])
    }

    useEffect(() => {
        init()
    }, [])

    return (
        <CookiesProvider>
            <div className='flexbox-container'>
                <H4 text={packageJson.name+'/'+packageJson.version}/>
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
                        initTreeData(-1,'noname')
                        setGridRows([])
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
                        setGridRows([])
                    }}
                />
                <S/>
                <input 
                    type="text" 
                    size={10}
                    placeholder="Manuf"
                    value={manufFilter}
                    onChange={(val)=>{ onManufFilterInput(val) }}/>
                <S/>
                <input 
                    type="text" 
                    size={10}
                    placeholder="Description"
                    value={descriptionFilter}
                    onChange={(val)=>{ onDescriptionFilterInput(val) }}/>
                <S/>
                <Combo
                    placeholder="Descr State"
                    options={descrStateOptions}
                    defaultChoice={{value: cookies.descrState, label: cookies.descrStateName}}
                    onChange={({value,label}) => {
                        setFooterText(label)
                        setDescrState(value)
                        setCookie('descrState', value, { path: '/' })
                        setCookie('descrStateName', label, { path: '/' })
                    }}
                />
                <S/>
                <Checkbox
                    defaultValue={langState.ua || false}
                    label='ua'
                    onChange={(e) => setLangState(prev => ({...prev, ua: e})) }
                />
                <S/>
                <Checkbox
                    defaultValue={langState.en || false}
                    label='en'
                    onChange={(e) => setLangState(prev => ({...prev, en: e})) }
                />
                <S/>
                <Checkbox
                    defaultValue={langState.ru || false}
                    label='ru'
                    onChange={(e) => setLangState(prev => ({...prev, ru: e})) }
                />
                <S/>
                <input 
                    type="text" 
                    size={3}
                    placeholder="Limit"
                    value={gridLimit}
                    onChange={(e:any)=>{ setGridLimit(e.target.value) }}/>
                <S/>
                <button onClick={initGridProd}>Применить</button>
                <button onClick={clearAll}>Очистить</button>
                <button onClick={initGridProd}>Action 3</button>
            </div> 
            
            <div className='flexbox-container2'>
                <div style={{width: '300px'}}>
                    <MultiSelectCheckbox 
                        data={treeData}
                        onSelect={(items: any) => setTreeSelected(items)}
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

            <Footer 
                text={footerText}
                backgroundColor={footerColor}
            />

        </CookiesProvider>
    )
}

export default MainWindow