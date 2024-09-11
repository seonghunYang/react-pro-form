"use client";
import React, { useCallback, useEffect, useRef, useState } from "react";

type FormElements = HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;

type Contidion = string;

type DependencyNode = {
  [stepKey: string]: Contidion;
};
type DependencyGraph = Record<string, DependencyNode[]>;

type Indegree = Record<string, number>;

type StepKeyToInputName = Map<string, string[]>;

function getDependencyGraph(
  children: React.ReactNode
): [Indegree, DependencyGraph, StepKeyToInputName] {
  const mapStepKeyToInputName = new Map<string, string[]>();
  const indegree: Indegree = {};
  const graphs: DependencyGraph = {};

  React.Children.toArray(children).forEach((child) => {
    if (!React.isValidElement(child)) return;
    if (child.type !== Step) return;
    const { stepKey, depends } = child.props as Step;

    const inputNames = findInputName(child.props.children);
    mapStepKeyToInputName.set(stepKey, inputNames);

    if (depends === undefined) {
      indegree[stepKey] = 0;
    } else {
      if (typeof depends === "string") {
        indegree[stepKey] = 1;
        graphs[depends] = (graphs[depends] || []).concat({ [stepKey]: "" });
      }

      if (Array.isArray(depends)) {
        indegree[stepKey] = depends.length;
        depends.forEach((name) => {
          graphs[name] = (graphs[name] || []).concat({ [stepKey]: "" });
        });
      }

      if (!Array.isArray(depends) && typeof depends === "object") {
        indegree[stepKey] = Object.keys(depends).length;
        Object.keys(depends).forEach((name) => {
          graphs[name] = (graphs[name] || []).concat({
            [stepKey]: depends[name],
          });
        });
      }
    }
  });

  return [indegree, graphs, mapStepKeyToInputName];
}

function getZeroIndegree(indegree: Indegree) {
  return Object.keys(indegree).filter((key) => indegree[key] === 0);
}

function topologicalSort(
  formState: Record<string, any>,
  indegree: Indegree,
  dependencyGraph: DependencyGraph,
  mapStepKeyToInputName: StepKeyToInputName
) {
  const indegreeCopy = { ...indegree };
  const queue: string[] = [];
  const result: string[] = [];
  // 차수가 0인 스탭을 찾아서 큐에 넣는다.
  queue.push(...getZeroIndegree(indegreeCopy));
  result.push(...getZeroIndegree(indegreeCopy));

  // 차수가 0인 스탭의 inputName을 순화하며 formState값을 사용해서 조건을 만족하면 해당 inputName에 의존하고 있는 스탭의 차수를 감소시킨다.
  while (queue.length) {
    const stepKey = queue.shift() as string;

    const inputNames = mapStepKeyToInputName.get(stepKey);
    inputNames?.forEach((inputName) => {
      dependencyGraph[inputName]?.forEach((node) => {
        Object.entries(node);
        const [key, condition] = Object.entries(node)[0];
        // key가 이미 result에 있다면 continue
        if (result.includes(key)) return;

        if (condition === "") {
          if (formState[inputName]) {
            indegreeCopy[key] -= 1;
            if (indegreeCopy[key] === 0) {
              queue.push(key);
              result.push(key);
            }
          }
        } else {
          if (formState[inputName] === condition) {
            indegreeCopy[key] -= 1;
            if (indegreeCopy[key] === 0) {
              queue.push(key);
              result.push(key);
            }
          }
        }
      });
    });
  }

  return result;
}

function ProgressiveFormRoot({ children }: React.PropsWithChildren<{}>) {
  // children의 deponds에 값들이 tocued 되었는지에 따라서 보여줅지 말지 확인
  const ref = useRef<HTMLFormElement>(null);
  const [formState, setFormState] = useState<Record<string, any>>({});

  // 노드가 바뀔 수 있으니 이벤트 재등록
  // 대신 formstate이 값이 바뀔 때 마다 갱신되지 않음
  useEffect(() => {
    const handleChage = (element: FormElements) => {
      setFormState((prev) => ({ ...prev, [element.name]: element.value }));
    };

    if (ref.current) {
      for (let i = 0; i < ref.current.elements.length; i++) {
        const element = ref.current.elements[i] as FormElements;

        element.addEventListener("change", (event) => {
          handleChage(event.target as FormElements);
        });
      }
    }

    return () => {
      if (ref.current) {
        for (let i = 0; i < ref.current.elements.length; i++) {
          const element = ref.current.elements[i] as FormElements;
          element.removeEventListener("change", (event) => {
            handleChage(event.target as FormElements);
          });
        }
      }
    };
  }, [formState]);

  return (
    <form ref={ref}>
      {React.Children.toArray(children).filter((child) => {
        if (!React.isValidElement(child)) return false;
        if (child.type !== Step) return false;

        const { depends } = child.props as Step;
        // depends 의 값이 특정 조건을 만족하는지 확인
        if (depends === undefined) return true;

        if (Array.isArray(depends)) {
          return depends.every((depend) => {
            if (formState[depend]) return true;
            return false;
          });
        }

        if (typeof depends === "string") {
          if (formState[depends]) return true;
          return false;
        }

        if (typeof depends === "object") {
          return Object.keys(depends).every((key) => {
            if (formState[key] === depends[key]) return true;
            return false;
          });
        }
        return false;
      })}
    </form>
  );
}

interface Step {
  stepKey: string;
  depends?: Record<string, any> | string[] | string;
  isError?: boolean;
}

function Step({
  stepKey,
  depends,
  isError,
  children,
}: React.PropsWithChildren<Step>) {
  return <>{children}</>;
}


const findInputName = (children: React.ReactNode) => {
  const result: string[] = [];
  React.Children.toArray(children).forEach((child) => {
    if (!React.isValidElement(child)) return;
    if (child.type === "input" && child.props.name) {
      result.push(child.props.name);
    } else {
      result.push(...findInputName(child.props.children));
    }
    // console.log(child);
  });
  return result;
};

export const ProgressiveForm = Object.assign(ProgressiveFormRoot, {
  Step: Step,
});
