// import React from "react";
// import { useState } from 'react';
import { FaSquare, FaCheckSquare, FaMinusSquare } from "react-icons/fa";
import { IoMdArrowDropright } from "react-icons/io";
import TreeView, { flattenTree, ITreeViewOnSelectProps, } from "react-accessible-treeview";
import cx from "classnames";
import "./styles.css";

function MultiSelectCheckbox(props: any) {

  const onSelect = (selprops: ITreeViewOnSelectProps) => {
    const nodes = data1.filter(({id}) => selprops.treeState.selectedIds.has(id));
    props.onSelect(nodes)
  };
  
  const data1 = flattenTree(props.data);
  
  return (
    <div style={{width: props.width || '300px'} }>
      <div className="checkbox">
        <TreeView
          data={data1}
          defaultExpandedIds={[1]}
          ref={props.ref}
          onSelect={onSelect}
          // onSelect={(props) => {
          //   console.log('onSelect callback: ', props)
          //   onSelect(props)
          // }}
          aria-label="Checkbox tree"
          multiSelect
          propagateSelect
          propagateSelectUpwards
          togglableSelect
          nodeRenderer={({
            element,
            isBranch,
            isExpanded,
            isSelected,
            isHalfSelected,
            getNodeProps,
            level,
            handleSelect,
            handleExpand,
          }) => {
            return (
              <div
                {...getNodeProps({ onClick: handleExpand })}
                style={{ marginLeft: 40 * (level - 1)  + (isBranch ? 0 : 20) }}
              >
                {isBranch && <ArrowIcon isOpen={isExpanded} />}
                <CheckBoxIcon
                  className="checkbox-icon"
                  onClick={(e: any) => {
                    handleSelect(e);
                    e.stopPropagation();
                  }}
                  variant={
                    isHalfSelected ? "some" : isSelected ? "all" : "none"
                  }
                />
                <span className="name">{element.name}</span>
              </div>
            );
          }}
        />
      </div>
    </div>
  );
}

const ArrowIcon = ({ isOpen, className }: any) => {
  const baseClass = "arrow";
  const classes = cx(
    baseClass,
    { [`${baseClass}--closed`]: !isOpen },
    { [`${baseClass}--open`]: isOpen },
    className
  );
  return <IoMdArrowDropright className={classes} />;
};

const CheckBoxIcon = ({ variant, ...rest }: any) => {
  switch (variant) {
    case "all":
      return <FaCheckSquare {...rest} />;
    case "none":
      return <FaSquare {...rest} />;
    case "some":
      return <FaMinusSquare {...rest} />;
    default:
      return null;
  }
};

export default MultiSelectCheckbox;