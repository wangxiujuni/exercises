/** 1. 信号灯控制器
 用 React 实现一个信号灯（交通灯）控制器，要求：
 1. 默认情况下，
 1.1. 红灯亮20秒，并且最后5秒闪烁
 1.2. 绿灯亮20秒，并且最后5秒闪烁
 1.3. 黄灯亮10秒
 1.4. 次序为 红-绿-黄-红-绿-黄
 2. 灯的个数、颜色、持续时间、闪烁时间、灯光次序都可配置，如：
 lights=[{color: '#fff', duration: 10000, twinkleDuration: 5000}, ... ]
 */

import React, { useEffect, useState } from "react";

interface Light {
  color: string;
  duration: number;
  twinkleDuration: number;
}

interface TrafficLightProps {
  lights?: Light[];
}

const setTimeoutPromise = async (
  handle: () => void,
  getTimerId: (timerId: number) => void,
  timeout: number
): Promise<void> =>
  new Promise((resolve, reject) => {
    try {
      getTimerId(
        setTimeout(() => {
          handle();
          resolve();
        }, timeout)
      );
    } catch (e) {
      reject(e);
    }
  });

function TrafficLight({ lights: lightsProps }: TrafficLightProps) {
  const [lighting, setLighting] = useState<number>();

  const lights = lightsProps ?? [
    {
      color: "red",
      duration: 20000,
      twinkleDuration: 4000,
    },
    {
      color: "green",
      duration: 20000,
      twinkleDuration: 5000,
    },
    {
      color: "yellow",
      duration: 10000,
      twinkleDuration: 0,
    },
  ];

  useEffect(() => {
    let timerId: number;
    const setTimerId = (id: number) => {
      timerId = id;
    };
    (async function start() {
      for (let i = 0; i < lights.length; i++) {
        const { duration, twinkleDuration } = lights[i];
        setLighting(i);
        await setTimeoutPromise(
          () => {
            setLighting(undefined);
          },
          setTimerId,
          duration - twinkleDuration
        );
        for (let j = 0; j < Math.trunc(twinkleDuration / 1000); j++) {
          setLighting(i);
          await setTimeoutPromise(
            () => {
              setLighting(undefined);
            },
            setTimerId,
            400
          );
          await setTimeoutPromise(() => {}, setTimerId, 600);
        }
      }
      start();
    })();
    return () => {
      clearTimeout(timerId);
    };
  }, [lights]);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      {lights.map(({ color }, index) => (
        <svg
          style={{
            padding: 10,
          }}
          width="50px"
          height="50px"
          key={index}
        >
          <circle
            r="25px"
            cx="25px"
            cy="25px"
            fill={lighting === index ? color : "gray"}
          />
        </svg>
      ))}
    </div>
  );
}

export default TrafficLight;
