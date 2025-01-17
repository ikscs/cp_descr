import { useEffect, useState } from 'react'
import Select from 'react-select'
// yarn add react-select

const customStyles = {
    menu: (provided: any) => ({ ...provided, textAlign: 'left', }), 
    option: (provided: any) => ({ ...provided, textAlign: 'left', }), 
    input: (provided: any) => ({...provided,  color: 'transparent', }),
}

interface IValueLabel {
    value: Object,
    label: string,
}

interface IComboProps {
    // ref?: any,
    // inputId?: string | undefined,
    placeholder: string | undefined,
    options: IValueLabel[],
    onChange: (choice: any) => void,
    defaultChoice?: IValueLabel | undefined,
}
// https://stackoverflow.com/questions/65640550/how-to-remove-text-cursor-on-select-in-react-select-library
// const MySelect: React.FC = () => ()

function Combo(props: IComboProps) {
    
    // console.log('Combo', props.placeholder, props.options, props.onChange)

    const [selectedOption, setSelectedOption] = useState<IValueLabel | null>(null)
    
    useEffect(() => {
        setSelectedOption(props.defaultChoice ? props.defaultChoice : null) 
    }, [props.options])
    
    const onChange = (choice: any) => {
        setSelectedOption(choice)
        props.onChange(choice)
    }

    return (
    <div style={{width: '150px'}}>
        <Select
            // inputId={props.inputId}
            value={selectedOption}
            styles={customStyles}
            // styles={{
            //     input: (baseStyles) => ({
            //     ...baseStyles,
            //     color: 'transparent',
            //     })
            // }}
            placeholder={props.placeholder||"Select..."}
            isClearable={false}
            className="react-select"
            classNamePrefix="select"
            options={props.options}
            onChange={onChange}
            // onChange={props.onChange}
        />
    </div>
    ) 
}

export default Combo