import { NodeViewWrapper } from "@tiptap/react";
import { FractionInput } from ".";
import { useEffect, useState } from "react";

const FractionField = (props) => {
  const { node, editor, updateAttributes } = props;

  const answer = JSON.parse(node?.attrs?.answer || "null");
  const explanation = node?.attrs?.explanation;
  const value = node?.attrs?.value;
  const isInfo = Boolean(answer || explanation);
  const isCorrect = node?.attrs?.isCorrect;

  const [fractionArr, setFractionArr] = useState([
    { id: 0, wholeNumber: "", numerator: "", denominator: "" },
  ]);

  const getResult = (res) => {
    updateAttributes({ value: res });
  };

  useEffect(() => {
    const wholeNumber = value?.split("\\frac")?.[0] || "";
    const numerator =
      value?.split("\\frac")?.[1]?.split("}{")?.[0]?.replace("{", "") || "";
    const denominator =
      value?.split("\\frac")?.[1]?.split("}{")?.[1]?.replace("}", "") || "";
    if (value !== null) {
      const value = [{ id: 0, wholeNumber, numerator, denominator }];
      setFractionArr(value);
    }
  }, [value]);

  return (
    <NodeViewWrapper className="rich-text-fraction-component">
      <FractionInput
        node={node}
        fractionArr={fractionArr}
        setFractionArr={setFractionArr}
        getResult={getResult}
        isEditor={editor}
        isInfo={isInfo}
        isCorrect={isCorrect}
        answer={answer}
        explanation={explanation}
      />
    </NodeViewWrapper>
  );
};

export default FractionField;
