import { useEffect, useState } from "react"
import { CookiesProvider, useCookies } from 'react-cookie'
import { /*getCount,*/ getData, } from '../api/dataTools'
import AppContext from "../contexts/AppContext"
import { treeToJson, getTreeData, putTreeSelected, } from "../tools/treetools"
import { getGridCols, getGridRows, toExcel } from '../tools/gridtools'
import '../components/footer.css'
import Footer from "../components/Footer"
import Combo, { IValueLabel } from "../components/combo"
import MultiSelectCheckbox from "../components/MultiSelectCheckbox"
import Grid from "../components/gridFilter"
import packageJson from '../../package.json';
// import { Input } from "react-select/animated"
import { InputString,InputNumber } from "../components/Input"

const emptyTree = treeToJson([], 'product_group', 'product_group')

const S = () => (<div style={{width: '10px'}}/>)

const H4 = (props: any) => (<h4 style={{margin: 8}}>{props.text}</h4>)

const MainWindow = () => {
    const [cookies, setCookie] = useCookies(['user','userFullName','descrState','descrStateName','descrType','transDir'])
    AppContext.userName = cookies.user
    const [user, setUser] = useState('') 
    const [subr, setSubr] = useState(-1);
    const [subj, setSubj] = useState('');
    const [userOptions, setUserOptions] = useState<IValueLabel[]>([]);
    const [roleOptions, setRoleOptions] = useState<IValueLabel[]>([]);
    const [subjectOptions, setSubjectOptions] = useState<IValueLabel[]>([]);
    const [treeData, setTreeData] = useState(emptyTree)
    const [treeSelected, setTreeSelected] = useState([])
    const [gridCols, setGridCols] = useState<any[]>([]);
    const [gridRows, setGridRows] = useState<[]>([]);
    const [gridLimit, setGridLimit] = useState(1000);
    const [manufFilter, setManufFilter] = useState('');
    const [articleFilter, setArticleFilter] = useState('');
    const [footerColor, setFooterColor] = useState('navy');
    const [textareaValue, setTextareaValue] = useState('');
    const [footerText, setFooterText] = useState('') 
    
    console.log(user)
    const init = async () => {
        
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

        setGridCols(getGridCols())
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
        rows.forEach((row: any) => { 
            if (row.parent_group === null) 
                row.parent_group = 'root' 
        })
        rows.unshift({product_group: 'root', parent_group: null, name: 'Root', subject_id: subj, subject_role: subr, })
        setTreeData(treeToJson(rows, 'product_group', 'parent_group'))
    }
    
    const longExec = async (f: Function) => {
        await withErrorHandling(async () => {
            await f()
        });
    }

    const initGrid = async () => {
        await longExec(async() => {
            await putTreeSelected(treeSelected, subr, subj)
            const data = await getGridRows(manufFilter, articleFilter, gridLimit)
            setTextareaValue(data.query)
            if (!data.ok) {
                throw new Error('Error fetching data') 
            }
            setGridRows(data.data)
        })
    }

    const rowKeyGetter = (row: any) => {
        return row.group +'/'+ row.manuf_org +'/'+ row.article_org
    }

    const onRowSelect = (rows: any) => {
        console.log(rows.size)
    }

    const withErrorHandling = async (asyncFunc: () => Promise<void>) => {
        try {
            setTextareaValue('')
            
            setFooterText('Running');
            setFooterColor('darkmagenta')
            await asyncFunc();
            setFooterText('Ok');
            setFooterColor('navy')
        } catch (error: unknown) {
            console.error('Error:', error);
            if (error instanceof Error) {
                setFooterText(error.message);
            } else {
                setFooterText('An unknown error occurred');
            }
            setFooterColor('red');
        }
    };

    const clearAll = () => {
        setManufFilter('')
        setArticleFilter('')
        setGridRows([])
        setTextareaValue('')
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
                    title="User"
                    width='100px'
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
                    title="Subject Role"
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
                    title="Subject"
                />
                <S/>
                <InputString
                    size={5}
                    placeholder="Manuf ?"
                    value={manufFilter}
                    setValue={setManufFilter}/>
                <InputString
                    size={5}
                    placeholder="Article ?"
                    value={articleFilter}
                    setValue={setArticleFilter}/>
                <InputNumber
                    size={3}
                    placeholder="Limit ?"
                    value={gridLimit}
                    setValue={setGridLimit}/>
                <S/>
                <button onClick={ initGrid }>Применить</button>
                <button onClick={clearAll}>Очистить</button>
                <button onClick={ () => toExcel(gridCols,gridRows)}>Excel</button>
                <S/>
            </div> 
            
            <div className='flexbox-container2'>
                <div title='tree' style={{width: '300px'}}>
                    <MultiSelectCheckbox 
                        data={treeData}
                        onSelect={(items: any) => setTreeSelected(items)}
                        width='300px'
                    />
                </div>

                <div style={{/*width: '100%',*/ height: '100%', }}>
                    <Grid width="1500px"
                        cols={gridCols}
                        rows={gridRows}
                        rowKeyGetter={rowKeyGetter}
                        // onCellClick={onCellClick}
                        onRowSelect={onRowSelect}
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
            <S/><label>-</label><S/><label>-</label>
        </CookiesProvider>
    )
}

export default MainWindow
