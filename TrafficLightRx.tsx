/**
 *  rxjs 版本仅省略了清除定时器的步骤，因为操作的不是同一数据源，只要取消订阅就好了。
 */
import React, { useEffect, useState } from "react";
import { from, Observable } from "rxjs";
import { concatAll, map } from "rxjs/operators";

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
  timeout: number
): Promise<void> =>
  new Promise((resolve, reject) => {
    try {
      setTimeout(() => {
        handle();
        resolve();
      }, timeout);
    } catch (e) {
      reject(e);
    }
  });

function TrafficLightRx({ lights: lightsProps }: TrafficLightProps) {
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

  useEffect(
    function start() {
      const subscription = from(lights)
        .pipe(
          map(({ duration, twinkleDuration }, index) => {
            twinkleDuration = Math.trunc(twinkleDuration / 1000) * 1000;
            return new Observable<number | undefined>((subscriber) => {
              (async () => {
                try {
                  subscriber.next(index);

                  await setTimeoutPromise(() => {
                    subscriber.next(undefined);
                  }, duration - twinkleDuration);

                  for (let i = 0; i < twinkleDuration; i += 1000) {
                    await setTimeoutPromise(() => {
                      subscriber.next(index);
                    }, 400);
                    await setTimeoutPromise(() => {
                      subscriber.next(undefined);
                    }, 600);
                  }
                  subscriber.complete();
                } catch (e) {
                  subscriber.error(e);
                }
              })();
            });
          }),
          concatAll()
        )
        .subscribe({
          next: (value) => {
            setLighting(value);
          },
          complete: () => {
            start();
          },
        });
      return () => {
        subscription.unsubscribe();
      };
    },
    [lights]
  );

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

export default TrafficLightRx;
