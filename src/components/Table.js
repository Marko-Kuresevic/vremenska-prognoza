import weatherCodes from './weatherCodes';
import useFetch from '../utilities/useFetch';
import { useState } from 'react';
import { Button, Table } from 'antd';

import tableStyles from '../styles/Table.module.css';

const formatDateTime = (dateTime) => {
  const date = dateTime.toLocaleDateString('hr-HR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
  const time = dateTime.toLocaleTimeString('hr-HR', {
    hour: '2-digit',
    minute: '2-digit'
  });
  return { date, time };
}

const renderWeatherTable = (rows) => {
  const dateGroups = {};

  rows.forEach((row) => {
    const date = row.date;
    if (!dateGroups[date]) {
      dateGroups[date] = {
        key: date,
        date: date,
        rows: [],
      };
    }
    dateGroups[date].rows.push(row);
  });

  const dates = Object.values(dateGroups).map((group) => ({
    ...group,
    rows: group.rows.sort((a, b) => (a.time > b.time ? 1 : -1)),
  }));

  const columns = [
    {
      title: 'Date',
      dataIndex: 'date',
      key: 'date',
      className: tableStyles.th,
    },
  ];

  const expandedRowRender = (record) => (
    <div>
      <Table
        dataSource={record.rows}
        columns={[
          {
            title: 'Time',
            dataIndex: 'time',
            key: 'time',
            align: 'right',
          },
          {
            title: 'Temperature',
            dataIndex: 'temperature',
            key: 'temperature',
            align: 'right',
          },
          {
            title: 'Weather',
            dataIndex: 'weatherDescription',
            key: 'weatherDescription',
            className: tableStyles.td,
            align: 'center',
          },
          {
            title: 'Wind speed',
            dataIndex: 'windSpeed',
            key: 'windSpeed',
            align: 'right',
          },
          {
            title: 'Wind direction',
            dataIndex: 'windDirection',
            key: 'windDirection',
            align: 'right',
          },
        ]}
        pagination={false}
      />
    </div>
  );

  return (
    <Table
      dataSource={dates}
      columns={columns}
      expandable={{
        expandedRowRender,
        rowExpandable: (record) => record.rows && record.rows.length > 0,
      }}
      pagination={false}
    />
  );
};

const WeatherTable = ({ adr, lat, lng }) => {
  const hourlyData = "temperature_2m,weathercode,windspeed_10m,winddirection_10m";
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&hourly=${hourlyData}&timezone=auto`;
  
  const today = new Date().toISOString().split('T')[0];
  const sevenDaysFromToday = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  const fifteenDaysFromToday = new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  const url2 = `${url}&start_date=${today}&end_date=${fifteenDaysFromToday}`;
  
  const [isFirstTable, setIsFirstTable] = useState(true);
  const [firstButtonActive, setFirstButtonActive] = useState(true);
  const [secondButtonActive, setSecondButtonActive] = useState(false);
  const { weatherData, isLoading, error } = useFetch(isFirstTable ? url : url2);

  let weatherRows = [];

  if (weatherData) {
    let prevDate = null;

    weatherData.hourly.temperature_2m.forEach((temp, i) => {
      const dateTime = new Date(weatherData.hourly.time[i]);
      const { date, time } = formatDateTime(dateTime);

      if (date !== prevDate) {
        prevDate = date;
      }

      const weatherCode = weatherData.hourly.weathercode[i];
      const weatherDescription = `${weatherCodes.find(
        (code) => parseInt(code.code) === parseInt(weatherCode)
      )?.description}`;

      const windSpeed = weatherData.hourly.windspeed_10m[i];

      const windDirection = weatherData.hourly.winddirection_10m[i];

      weatherRows.push({
        time,
        temperature: `${temp} °C`,
        weatherDescription,
        windSpeed: `${windSpeed} km/h`,
        windDirection: `${windDirection} °`,
        key: i.toString(),
        date
      });
    });
  }

  const renderWeatherData = () => {
    setIsFirstTable(true);
    setFirstButtonActive(true);
    setSecondButtonActive(false);
  };

  const renderWeatherData2 = () => {
    setIsFirstTable(false);
    setFirstButtonActive(false);
    setSecondButtonActive(true);
  };

  return (
    <>
      <div className={tableStyles.center}>
        <h2>Hourly Weather Information - {adr}</h2>
        <div>
          <Button
            className={`${tableStyles.button} ${firstButtonActive ? tableStyles.active : ''}`}
            onClick={renderWeatherData}
          >
            One week ({today} - {sevenDaysFromToday})
          </Button>

          <Button
            className={`${tableStyles.button} ${secondButtonActive ? tableStyles.active : ''}`}
            onClick={renderWeatherData2}
          >
            15 days ({today} - {fifteenDaysFromToday})
          </Button>
        </div>
      </div>
      {isLoading ? <p>Loading table...</p> : 
        <div>
          {weatherRows.map((row, index) => {
            if (row.key.startsWith('date-')) {
              return (
                <h3 key={row.key}>{row.date}</h3>
              );
            }
            return null;
          })}
          {renderWeatherTable(weatherRows)}
        </div>
      }
      {error && <p>Error: {error.message}</p>}
    </>
  );
}

export default WeatherTable;
