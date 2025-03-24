import { useEffect, useState } from "react"
import { CookiesProvider, useCookies } from 'react-cookie'
import { /*getCount,*/ getData, } from '../api/dataTools'
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import 'react-tabs/style/react-tabs.css';
import AppContext from "../contexts/AppContext"
import { treeToJson, getTreeData, putTreeSelected, } from "../tools/treetools"
import { getGridCols, getGridRows, IFlaggedValue, productFind, toExcel } from '../tools/gridtools'
import '../components/footer.css'
import Footer from "../components/Footer"
// import FooterMulti from "../components/footer_multi";
import Combo, { IValueLabel } from "../components/combo"
import MultiSelectCheckbox from "../components/MultiSelectCheckbox"
import Grid from "../components/gridFilter"
import packageJson from '../../package.json';
import { InputString,InputNumber } from "../components/Input"
import Checkbox from "../components/checkbox";
import ManufGridView from "./ManufGridView";
import { usePresetContext, dataSourceOptions } from "../contexts/PresetContext";
import { presetDataGet, presetDataPost } from "../tools/presettools";
import NameGridView from "./NameGridView";
import PresetView from "./PresetView";
import RawDataView from "./RawDataView";
import ArticleGridView from "./ArticleGridView";
import { useHotkeys } from 'react-hotkeys-hook'
import { imageFindUrl } from "../tools/imagetools";
import LoggerView from "./LoggerView";
import { useLoggerContext } from "../contexts/LoggerContext";
import QueryEditView from "./QueryEditView";
import MyLineChart from "../temp/MyLineChart";
import MyLineChart2 from "../temp/MyLineChart2";
import MUIExample from "../temp/MUIExample";

const emptyTree = treeToJson([], 'product_group', 'product_group')

const emptySubj = 'emptySubj'
const defaultRole = 0

const S = () => (<div style={{width: '10px'}}/>)

const H4 = (props: any) => (<h4 style={{margin: 8}}>{props.text}</h4>)

// interface IFooterState {
//     status: string;
//     records: number;
//     selected: number;
//     info: string;
//     color: string;
// }

const MainWindow = () => {
    const [cookies, setCookie] = useCookies(['user','userFullName','preset'])
    AppContext.userName = cookies.user
    const [user, setUser] = useState('') 
    const [subr, setSubr] = useState(-1);
    const [subj, setSubj] = useState(emptySubj);
    const { 
        preset, setPreset, 
        manufGridRowsSelected, setManufGridRowsSelected,
        manufGridRows, setManufGridRows,
        articleGridRows, setArticleGridRows,
        articleGridRowsSelected, setArticleGridRowsSelected,
        articleInvert, setArticleInvert,
        nameGridRows, setNameGridRows,
        nameGridRowsSelected, setNameGridRowsSelected,
        presetDataSource,setPresetDataSource,
        autostart, setAutostart,
        presetQuery, setPresetQuery,
        /*manufGridCols, setManufGridCols,*/
    } = usePresetContext();

    const {loggerText, setLoggerText} = useLoggerContext();

    const [dataSource, setDataSource] = useState('');
    const [userOptions, setUserOptions] = useState<IValueLabel[]>([]);
    const [roleOptions, setRoleOptions] = useState<IValueLabel[]>([]);
    const [subjectOptions, setSubjectOptions] = useState<IValueLabel[]>([]);
    const [presetOptions, setPresetOptions] = useState<IValueLabel[]>([]);
    const [treeData, setTreeData] = useState(emptyTree)
    const [treeSelected, setTreeSelected] = useState([])
    const [gridCols, setGridCols] = useState<any[]>([]);
    const [gridRows, setGridRows] = useState<[]>([]);
    const [gridLimit, setGridLimit] = useState(100000);
    const [manufFilter, setManufFilter] = useState('');
    const [articleFilter, setArticleFilter] = useState('');
    const [footerColor, setFooterColor] = useState('navy');
    // const [textareaValue, setTextareaValue] = useState('');
    const [footerText, setFooterText] = useState('')
    const [presetEnabled, setPresetEnabled] = useState<boolean>(true) 
    const [presetSaveTo,setPresetSaveTo] = useState('')
    // const [tabFilterColor,setTabFilterColor] = useState('yellow')

    const [rawSubjectRole,setRawSubjectRole] = useState(-1)
    const [rawSubjectId,setRawSubjectId] = useState('')
    const [rawProductId,setRawProductId] = useState('')

    const [manufToGoogle, setManufToGoogle] = useState('')
    const [articleToGoogle, setArticleToGoogle] = useState('')

    const [tabIndex, setTabIndex] = useState(0);
    const [lastQuery, setLastQuery] = useState('')
    
    console.log('MainWindow', user)

    const init = async () => {
        
        setUserOptions(await getData({
            from: 'cp3.perm_user', 
            fields: 'user_name,user_full_name',
            order: 'user_full_name',
        }, 'user_name','user_full_name'))
        
        setUser(cookies.user)
        setDataSource(dataSourceOptions[1].value)

        setRoleOptions(await getData({
            from: 'cp3.cp_subject_role', 
            // fields: 'subject_role,description',
            fields: 'subject_role, subject_role||\'\'-\'\'||description AS description',
            order: 'subject_role',
        }, 'subject_role','description'))

        setSubr(defaultRole)

        setPresetOptions(await getData({
            from: 'cp3.perm_preset', 
            fields: 'preset_id',
            where: {app_id: packageJson.name},
            order: 'preset_id',
        }, 'preset_id', 'preset_id'))

        setGridCols(getGridCols())

        const queryParameters = new URLSearchParams(window.location.search)
        const preset_ = queryParameters.get('preset')
        console.log('preset', preset_)
        // onComboPresetChange({value: !!preset_ ? preset_ : '1'}) // default preset
        preset_ && onComboPresetChange({value: preset_}) // no default preset
        // setTabFilterColor(!!preset_ ? 'yellow' : 'white')
        setPresetEnabled(!!preset_)
    }
    
    const initSubjects = async (subr: number) => {
        const data = await getData({
            from: 'cp3.cp_subject', 
            fields: 'subject_id,name',
            order: 'subject_id',
            where: { subject_role: subr}
        }, 'subject_id','name')
        data.unshift({value: emptySubj, label: 'All'})
        setSubjectOptions(data)
    }
    
    const initTreeData = async (subr: number, subj: string) => {
        const rows = await getTreeData(subr, subj)
        rows.forEach((row: any) => { 
            if (row.parent_group === null) 
                row.parent_group = 'root' 
        })
        rows.unshift({product_group: 'root', parent_group: null, name: 'Root', subject_id: subj, subject_role: subr, })
        setTreeData(treeToJson(rows, 'product_group', 'parent_group'))
        setTreeSelected([])
    }
    
    const longExec = async (f: Function) => {
        await withErrorHandling(async () => {
            await f()
        });
    }

    const initGrid = async () => {
        setTabIndex(0)
        setGridRows([])
        await longExec(async() => {
            // setFooterState({... footerState, status: 'Running', color: 'darkmagenta'})
            subj != emptySubj && await putTreeSelected(treeSelected, subr, subj)

            const manufList: string[] = presetEnabled ? manufGridRows
                .filter(data => manufGridRowsSelected?.has(data.key))
                .map(data => data.value) : [];

            const articleList: IFlaggedValue[] = presetEnabled ? articleGridRows
                .filter(data => articleGridRowsSelected?.has(data.key))
                .map(data => data ) : [];

            const nameList: string[] = presetEnabled ? nameGridRows
                .filter(data => nameGridRowsSelected?.has(data.key))
                .map(data => data.value) : [];

            const data = await getGridRows(subj == emptySubj, subr, manufFilter, articleFilter, 
                gridLimit, manufList, articleList, articleInvert, nameList, 
                presetEnabled ? presetDataSource : dataSource,
                presetEnabled ? presetQuery : ''
            )
            
            log(data.query)
            setLastQuery(data.query)

            if (!data.ok) {
                throw new Error('Error fetching data') 
            }
            setGridRows(data.data)
            // setFooterState({... footerState, records: data.records, selected: data.selected, info: '', color: 'navy'})  
        })
    }

    const log = (text: string) => {
        // text = text.replace(/(\'\')/gm, '\'\'')
        setLoggerText(loggerText + text + '\n');
    };

    const rowKeyGetter = (row: any) => {
        // return row.group +'/'+ row.manuf_org +'/'+ row.article_org
        return row.subject_role +'/'+ row.subject_id +'/'+ row.product_id  +'/'+ row.group
    }

    const onRowSelect = (rows: any) => {
        console.log(rows.size)
        if (rows.size == 0)
            return

        // var x = new Set();
        // x.add(1);
        // x.add({ a: 2 });
        //get iterator:
        var it = rows.values();
        //get first entry:
        var first = it.next();
        //get value out of the iterator entry:
        var value = first.value;
        console.log(value); //1

        const key = value.split('/')

        if (key[0] == '0') {
            const row: any = gridRows.find((row: any) => 
                row.subject_role == key[0] && 
                row.subject_id == key[1] && 
                row.product_id == key[2])
            console.log(row)
            row && setRawSubjectRole(row.subject_role_org)
            row && setRawSubjectId(row.subject_id_org)
            row && setRawProductId(row.product_id_org)
        } else {
            setRawSubjectRole(parseInt(key[0]))
            setRawSubjectId(key[1])
            setRawProductId(key[2])
        }
    }

    const withErrorHandling = async (asyncFunc: () => Promise<void>) => {
        try {
            // setTextareaValue('')
            
            setFooterText('Running');
            setFooterColor('darkmagenta')
            // setFooterState({... footerState, status: 'Running', color: 'darkmagenta'})
            await asyncFunc();
            setFooterText('Ok');
            setFooterColor('navy')
            // setFooterState({... footerState, status: 'Ok', color: 'navy', records: rows||0, info: ''})
        } catch (error: unknown) {
            if (error instanceof Error) {
                console.error('Error:', error);
                setFooterText(error.message);
                // setFooterState({... footerState, status: 'Error', color: 'red', info: error.message})
            } else {
                console.error('Error: unknown error');
                setFooterText('An unknown error occurred');
                // setFooterState({... footerState, status: 'Error', color: 'red', info: 'An unknown error occurred'})
            }
            setFooterColor('red');
        }
    };

    const setDataSourceAndRole = (dataSource: string) => {
        if (dataSource == 'cp3.ikscs') {
            setSubr(0)
            initSubjects(0)
        } else if (dataSource == 'cp3.vcp_product_org_rated') {
            setSubr(2)
            initSubjects(2)
        } else {
            setSubr(2)
            initSubjects(2)
        }
        setDataSource(dataSource)
    }

    const onComboPresetChange = async ({value}: { value: string }) => {
        const {
            presetDataSource,
            manufRows, manufSelected, 
            articleRows, articleSelected, articleInvert,
            nameRows, nameSelected,
            autostart,
            presetQuery
        } = await presetDataGet(value)

        setPreset(value)
        setPresetDataSource(presetDataSource)
        setManufGridRows(manufRows)
        setManufGridRowsSelected(new Set(manufSelected))
        setArticleGridRows(articleRows)
        setArticleGridRowsSelected(new Set(articleSelected))
        setArticleInvert(articleInvert)
        setNameGridRows(nameRows)
        setNameGridRowsSelected(new Set(nameSelected))
        setCookie('preset', value, { path: '/' })

        setDataSourceAndRole(presetDataSource)
        setAutostart(autostart)
        setPresetQuery(presetQuery)
    }

    const clearAll = () => {
        setManufFilter('')
        setArticleFilter('')
        setGridRows([])
        // setTextareaValue('')
        setPresetEnabled(false)
        // setTabFilterColor('white')
    }

    useEffect(() => {
        init()
    }, [])

    useEffect(() => {
        if (autostart) {
            initGrid()
        }
    }, [preset])

    useEffect(() => { // hotkeys -- do not forget to remove event listener
        const handleKeyDown = (event: any) => {
            if (event.ctrlKey && event.shiftKey && event.key === 'H') {
                searchHub()
            } else if (event.ctrlKey && event.shiftKey && event.key === 'F') {
                searchJoomla()
            } else if (event.ctrlKey && event.shiftKey && event.key === 'G') {
                searchGoogle()
            } else if (event.key === 'F9') {
                initGrid()
            }
        };

        document.addEventListener('keydown', handleKeyDown);

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, []);

    const savePreset = async () => {
        await longExec(async() => {
            await presetDataPost(preset,
                presetDataSource,
                manufGridRows, manufGridRowsSelected,
                articleGridRows, articleGridRowsSelected, articleInvert,
                nameGridRows, nameGridRowsSelected,
                autostart,
                presetQuery,
            )
        })
    }

    const savePresetAs = async () => {
        await longExec(async() => {
            if (!presetSaveTo)
               throw new Error('Preset name is Empty');

            const r = await presetDataPost(presetSaveTo, 
                presetDataSource,
                manufGridRows, manufGridRowsSelected,
                articleGridRows, articleGridRowsSelected, articleInvert,
                nameGridRows, nameGridRowsSelected,
                autostart,
                presetQuery,
            )
            console.log('r',r)
        })
    }

    const getDefaultChoice = (options: IValueLabel[], value: number | string) => {
        const found = options.find((opt) => opt.value == value);
        return found
    }

    // const getSubrLabel = (v: number): string => {
    //     const found = roleOptions.find((opt) => opt.value == v);
    //     return found?.label || 'No Data'
    // }

    const openInNewTab = (url: string) => {
        const newWindow = window.open(url, '_blank', 'noopener,noreferrer')
        if (newWindow) newWindow.opener = null
    }

    const searchGoogle = () => openInNewTab('https://www.google.com/search?q=' + articleToGoogle)
    const searchHub = async () => {
        // openInNewTab(`https://rise.theweb.place/p/0/${manufToGoogle}/${articleToGoogle}/${articleToGoogle}.webp`)
        const url = await imageFindUrl(manufToGoogle,articleToGoogle)
        openInNewTab(url == '' ? `https://www.google.com/search?q=${articleToGoogle}&udm=2` : url)
    } 
    const searchJoomla = async () => {
        const found = await productFind(manufToGoogle,articleToGoogle)
        if (found.ok) {
            const dict: { [id: string]: string; } = {
                ikscs: 'https://ikscs.in.ua/store/product/view/',
                mc: 'https://mc.in.ua/store/product/view/',
            }
            const schema = found.schema || 'ikscs'
            const url = dict[schema] + found.category_id + '/' + found.product_id
            console.log('(url',url)
            openInNewTab(url)
        } else {
            alert(`Cannot find ${manufToGoogle} / ${articleToGoogle}}`)
        }
    }
    // react-hotkeys
    // react-hot-keys
    // react-hotkeys-hook
    // useHotkeys('ctrl+k', () => setCount(count + 1), [count])
    useHotkeys('ctrl+shift+g', () => openInNewTab('https://www.google.com/search?q=' + articleToGoogle))
    useHotkeys('ctrl+shift+f', async () => {
        const found = await productFind(manufToGoogle,articleToGoogle)
        if (found.ok) {
            const dict: { [id: string]: string; } = {
                ikscs: 'https://ikscs.in.ua/store/product/view/',
                mc: 'https://mc.in.ua/store/product/view/',
            }
            const schema = found.schema || 'ikscs'
            const url = dict[schema] + found.category_id + '/' + found.product_id
            console.log('(url',url)
            openInNewTab(url)
        } else {
            alert(`Cannot find ${manufToGoogle} / ${articleToGoogle}}`)
        }
    })
    useHotkeys('ctrl+shift+h', async () => {
        console.log('ctrl+shift+h')
        await searchHub() 
    })
    useHotkeys('F9', async () => {initGrid()})
    
    const onCellClick = (row: any) => {
        // console.log(row.row.article)
        setManufToGoogle(row.row.manuf)
        setArticleToGoogle(row.row.article)
    }
    
    const onSelectedCellChange = (cellInfo: any) => {
        setManufToGoogle(cellInfo.row.manuf)
        setArticleToGoogle(cellInfo.row.article)

        setRawSubjectRole(cellInfo.row.subject_role_org || cellInfo.row.subject_role)
        setRawSubjectId(cellInfo.row.subject_id_org || cellInfo.row.subject_id)
        setRawProductId(cellInfo.row.product_id_org || cellInfo.row.product_id)
    }

    // const [footerState, setFooterState] = useState<IFooterState>({
    //     status: 'ожидание',
    //     records: 0,
    //     selected: 0,
    //     info: '',
    //     color: 'navy',
    // });
    
    // const footerSections = [
    //     { title: 'Статус', value: footerState.status, width: '200px' },
    //     { title: 'Записей', value: footerState.records, width: '150px' },
    //     { title: 'Отобрано', value: footerState.selected, width: '150px' },
    //     { title: 'Info', value: footerState.info, width: '500px' },
    // ];
    // console.log(setFooterState, footerSections)
   
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
                    placeholder="DataSource"
                    options={dataSourceOptions}
                    defaultChoice={getDefaultChoice(dataSourceOptions, dataSource)}
                    onChange={({value,label}) => {
                        setFooterText(label)
                        setDataSourceAndRole(value)
                    }}
                    title="DataSource"
                />
                <S/>
                <Combo
                    placeholder="Role"
                    options={roleOptions}
                    defaultChoice={getDefaultChoice(roleOptions, subr)}
                    onChange={({value,label}) => {
                        setFooterText(label)
                        setSubr(value)
                        initSubjects(value)
                        setSubj(emptySubj)
                        initTreeData(-1,emptySubj)
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
                    setValue={setManufFilter}
                    />
                <InputString
                    size={30}
                    placeholder="Article, Name ?"
                    value={articleFilter}
                    setValue={setArticleFilter}/>
                <InputNumber
                    size={3}
                    placeholder="Limit ?"
                    value={gridLimit}
                    setValue={setGridLimit}/>
                <S/>
                <button title={'F9'} onClick={ initGrid }>Выбрать</button>
                <button onClick={clearAll}>Очистить</button>
                <button onClick={ () => toExcel(gridCols,gridRows)}>Excel</button>
                <button title={'Search Google (ctrl+shift+g)'} onClick={ searchGoogle }>G</button>
                <button title={'Search Joomla (ctrl+shift+f)'} onClick={ searchJoomla }>F</button>
                <button title={'Search Image Hub (ctrl+shift+h)'} onClick={ searchHub }>H</button>
                <S/>
            </div> 
            
            <div className='flexbox-container'>
                <div title='tree' style={{width: '300px'}}>
                    <MultiSelectCheckbox 
                        data={treeData}
                        onSelect={(items: any) => setTreeSelected(items)}
                        width='300px'
                    />
                </div>
                <Tabs selectedIndex={tabIndex} onSelect={(index) => setTabIndex(index)}>
                    <TabList>
                        <Tab key='1' tabIndex='1'>Data</Tab>
                        <Tab key='2' tabIndex='2' style={{
                            // backgroundColor: tabFilterColor,
                            // borderColor: '#aaa',
                            // backgroundClip: 'initial'
                        }}>Data Filter {presetEnabled ? ' - ' + preset : ''}</Tab>
                        <Tab key='3' tabIndex='3'>Presets</Tab>
                        <Tab key='4' tabIndex='4'>Raw Data</Tab>
                        <Tab key='5' tabIndex='5'>Logger</Tab>
                        <Tab key='6' tabIndex='6'>Charts</Tab>
                    </TabList>
                    <TabPanel key='1'>
                        <div style={{/*width: '100%',*/ height: '100%', }}>
                            <Grid 
                                // width="1500px"
                                width="100%"
                                cols={gridCols}
                                rows={gridRows}
                                rowKeyGetter={rowKeyGetter}
                                onCellClick={onCellClick}
                                onSelectedRowsChange={onRowSelect}
                                onSelectedCellChange={onSelectedCellChange}
                            />
                        </div>
                    </TabPanel>
                    <TabPanel key='2'>
                        <div style={{/*width: '100%',*/ height: '100%', }}>
                            
                            <div className='flexbox-container-single'>
                            <label>Пресет</label><S/>
                            <Combo
                                placeholder='Unknown'
                                defaultChoice={{value: preset, label: preset}}
                                options={presetOptions}
                                onChange={onComboPresetChange}
                                title='Preset'
                            />
                            <button
                                style={{ marginLeft: '8px', cursor: 'pointer' }}
                                title="Save Preset"
                                onClick={savePreset}
                            >Сохранить</button>&nbsp;
                            <button
                                style={{ marginLeft: '8px', cursor: 'pointer' }}
                                title="Save Preset"
                                onClick={savePresetAs}
                            >Сохранить как</button>&nbsp;
                            <InputString
                                    size={5}
                                    placeholder="preset ?"
                                    value={presetSaveTo}
                                    setValue={setPresetSaveTo}/>
                            </div>

                            <Checkbox
                                label='Включить'
                                checked={presetEnabled}
                                onChange={(v) => {
                                    // setTabFilterColor(v ? 'yellow' : 'white')
                                    setPresetEnabled(v)
                                }}
                            />
                            <br/>
                            <div className='flexbox-container-single'>
                                <label>DataSource</label><S/>
                                <Combo
                                    placeholder="DataSource"
                                    options={dataSourceOptions}
                                    defaultChoice={
                                        getDefaultChoice(dataSourceOptions, presetDataSource)
                                    }
                                    title="DataSource"
                                    // onChange={setPresetDataSource}
                                    onChange={({value}) => {
                                        setPresetDataSource(value)
                                    }}
                                />
                                <S/>
                                <Checkbox
                                    label='Автозапуск'
                                    checked={autostart}
                                    onChange={(v) => {
                                        setAutostart(v)
                                    }}
                                />

                            </div>

                            <div className='flexbox-container'>
                                <S/>
                                <ManufGridView/>
                                <S/>
                                <ArticleGridView/>
                                <S/>
                                <NameGridView/>
                                <S/>
                                <QueryEditView sourceQuery={lastQuery}/>
                            </div>
                        </div>
                    </TabPanel>
                    <TabPanel key='3'>
                        <PresetView/>
                    </TabPanel>
                    <TabPanel key='4'>
                        <RawDataView 
                            subject_role={rawSubjectRole}
                            subject_id={rawSubjectId}
                            product_id={rawProductId}
                        />
                    </TabPanel>
                    <TabPanel key='5'>
                        <LoggerView/>
                    </TabPanel>
                    <TabPanel key='6'>
                        <MyLineChart/>
                        <S/><S/>
                        <MyLineChart2/>
                        <S/><S/>
                        <MUIExample/>
                    </TabPanel>
                </Tabs>
            </div>
            
            {/* 
            <br/><button onClick={() => openInNewTab('https://stackoverflow.com')}>openInNewTab</button>
            <br/><button onClick={() => openInNewTab('https://rise.theweb.place/back/f1.php?f=cp3.get_cp_product_r2&p=ERC')}>openInNewTab</button> 
            */}
            
            <Footer 
                text={footerText}
                backgroundColor={footerColor}
            />
            {/* <FooterMulti
                sections={footerSections}
                backgroundColor={footerState.color}
            /> */}
            <S/><label>-</label><S/><label>-</label>
        </CookiesProvider>
    )
}

export default MainWindow
