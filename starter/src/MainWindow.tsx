import { useEffect, useState } from "react"
import './components/footer.css'
import Footer from "./components/Footer"
import Modal from "./components/modal"
import Combo from "./components/combo"

interface ValueLabel {
    value: Object,
    label: string,
}

const constUserOptions = [
    {value: 'alavr', label: 'Александр'},
    {value: 'wlodek', label: 'Владимир'},
    {value: 'iyury', label: 'Юрий'},
]

const S = () => (<div style={{width: '20px'}}/>)

const H = (props: any) => (<h4 style={{margin: 8}}>{props.text}</h4>)

const MainWindow = () => {
    const [footerText, setFooterText] = useState('Unknown') 
    const [userOptions, setUserOptions] = useState<ValueLabel[]>([]);
    const [user, setUser] = useState('Unknown') 

    useEffect(() => {
        // setUserOptions(/*permData.*/get('descr_user'))
        setUserOptions(constUserOptions)
    }, [])

    return (
        <>
            <div className='flexbox-container'>
                <H text='Рабочее'/>
                <Combo
                    placeholder="No user"
                    options={userOptions}
                    onChange={({value,label}) => {
                        setFooterText(label)
                        setUser(value)
                    }}
                />
                <S/>
                {/* <div style={{width: '30px'}}/> */}
                <Combo
                    placeholder="Role"
                    options={userOptions}
                    onChange={({value,label}) => {
                        setFooterText(label)
                        setUser(value)
                    }}
                />
                <div style={{width: '30px'}}/>
                </div>
                {/* <div className='top-right'>
                    <Combo
                        placeholder="No user"
                        options={userOptions}
                        onChange={({value,label}) => {
                            setFooterText(label)
                            setUser(value)
                        }}
                    />
                </div> */}
            {/* <div className='top-left'>
                <h3>className</h3>
            </div> */}
            <p style={{color: 'black', textAlign: 'left'}}>text</p>
            <Footer text={footerText}>
            </Footer>
        {/* </div> */}
        </>
    )
}

const MainWindow1 = () => {
    const [footerText, setFooterText] = useState('Unknown') 
    const [userOptions, setUserOptions] = useState<ValueLabel[]>([]);
    const [user, setUser] = useState('Unknown') 

    useEffect(() => {
        setUserOptions(constUserOptions)
      }, [])
      
    const [open, setOpen] = useState(false);

    const handleClose = () => {
        setOpen(false)
    }

    const handleOpen = () => {
        setOpen(true)
    }

    return (
    <div>
        {/* <h4>Modal Component in ReactJS?</h4> */}
        <button type="button" onClick={handleOpen}>
            Select user
        </button>
        <Modal 
            isOpen={open} 
            onClose={handleClose
        }>
            <span>
                {/* <h3>A computer science portal!</h3> */}
                <Combo
                    // selected={user}
                    placeholder="Select user"
                    options={userOptions}
                    onChange={({value,label}) => {
                        setFooterText(label)
                        setUser(value)
                        handleClose()
                    }}
                />
            </span>
            <button type="button" onClick={handleClose}>
                Close
            </button>
        </Modal>

        {/* <div style={{width: 200}}>
            <Combo
                placeholder="No user"
                options={userOptions}
                onChange={({value,label}) => {
                    setFooterText(label)
                    setUser(value)
                }}
            />
        </div> */}
        <p style={{color: 'black', textAlign: 'left'}}>text</p>
        <Footer text={footerText}>
        </Footer>
    </div>
    )
}

export default MainWindow