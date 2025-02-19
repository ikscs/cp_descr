interface IInputStringProps {
    size: number,
    placeholder?: string,
    value: string,
    setValue: (value: string) => void,
}

interface IInputNumberProps {
    size: number,
    placeholder?: string,
    value: number,
    setValue: (value: number) => void,
}

const InputString: React.FC<IInputStringProps> = ({ size, value, setValue, placeholder }) => {

    return (
    <>
        <input 
            type="text" 
            size={size}
            placeholder={placeholder}
            value={value}
            onChange={(e:any)=>{ setValue(e.target.value) }}/>
        
        <div style={{width: '10px'}}/>
    </>
    )
}

const InputNumber: React.FC<IInputNumberProps> = ({ size, value, setValue, placeholder }) => {

    return (
    <>
        <input 
            type="text" 
            size={size}
            placeholder={placeholder}
            value={value}
            onChange={(e:any)=>{ setValue(e.target.value) }}/>
        
        <div style={{width: '10px'}}/>
    </>
    )
}

export {InputString, InputNumber}
