import React, { useEffect, useState } from 'react';
import { useTable, useSortBy } from 'react-table';
import { FaSort, FaSortUp, FaSortDown } from 'react-icons/fa';
import axios from 'axios';

const ReactTable = () => {
  const [data, setData] = useState([]);
  const [originalData, setOriginalData] = useState([]);
  const [sortConfig, setSortConfig] = useState({
    key: '',
    direction: ''
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(
          'https://s3-ap-southeast-1.amazonaws.com/he-public-data/reciped9d7b8c.json'
        );
        setData(response.data);
        setOriginalData(response.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

  const storedData = localStorage.getItem('tableData');
  if (storedData) {
    setData(JSON.parse(storedData));
  } else {
    fetchData();
  }
  }, []);

  const sortData = (key) => {
    let direction = 'ascending';
  
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
  
    const sortedData = [...data].sort((a, b) => {
      if (key === 'name') {
        const valueA = a[key];
        const valueB = b[key];
        const firstLetterA = valueA.charAt(0).toUpperCase();
        const firstLetterB = valueB.charAt(0).toUpperCase();
  
        if (firstLetterA < firstLetterB) return direction === 'ascending' ? -1 : 1;
        if (firstLetterA > firstLetterB) return direction === 'ascending' ? 1 : -1;
        return 0;
      }
  
      const valueA = typeof a[key] === 'string' ? parseFloat(a[key]) : a[key];
      const valueB = typeof b[key] === 'string' ? parseFloat(b[key]) : b[key];
  
      if (valueA < valueB) return direction === 'ascending' ? -1 : 1;
      if (valueA > valueB) return direction === 'ascending' ? 1 : -1;
      return 0;
    });
  
    setData(sortedData);
    setSortConfig({ key, direction });
  };
  
  
  


  const saveData = () => {
    console.log('Save clicked');
    console.log('Updated data:', data);
  
    //data in local storage
    localStorage.setItem('tableData', JSON.stringify(data));
  
    const updatedData = data.map((item) => {
      return {
        ...item,
        price: item.price,
      };
    });
    setData(updatedData);
  };

  const resetData = () => {
    localStorage.removeItem('tableData');
  
    window.location.reload(false);
    setData(originalData);
  };
  
  const getSortIcon = (key) => {
    if (sortConfig.key === key) {
      return sortConfig.direction === 'ascending' ? <FaSortUp /> : <FaSortDown />;
    }
    return <FaSort />;
  };

  const columns = React.useMemo(
    () => [
      {
        Header: () => (
          <div style={{ display: 'flex', alignItems: 'center' }}>
            Name
            <span
              style={{ marginLeft: '5px', cursor: 'pointer' }}
              onClick={() => sortData('name')}
            >
              {getSortIcon('name')}
            </span>
          </div>
        ),
        accessor: 'name',
      },
      { Header: 'Category', accessor: 'category' },
      { Header: 'Label', accessor: 'label' },
      {
        Header: () => (
          <div style={{ display: 'flex', alignItems: 'center' }}>
            Price
            <span
              style={{ marginLeft: '5px', cursor: 'pointer' }}
              onClick={() => sortData('price')}
            >
              {getSortIcon('price')}
            </span>
          </div>
        ),
        accessor: 'price',
        Cell: ({ cell }) => (
          <input
            type="text"
            value={cell.value}
            onChange={(e) => {
              const updatedData = [...data];
              updatedData[cell.row.index].price = e.target.value;
              setData(updatedData);
            }}
          />
        ),
      },
    ],
    [data, sortConfig]
  );

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow,
  } = useTable({ columns, data }, useSortBy);

  return (
    <>
      <table {...getTableProps()} style={{ borderCollapse: 'collapse', width: '100%' }}>
        <thead>
          {headerGroups.map((headerGroup) => (
            <tr
              {...headerGroup.getHeaderGroupProps()}
              style={{ color: 'black', textAlign: 'left', fontWeight: 'bold' }}
            >
              {headerGroup.headers.map((column) => (
                <th {...column.getHeaderProps()} style={{  padding: '18px' }}>
                  {column.render('Header')}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody {...getTableBodyProps()}>
          {rows.map((row) => {
            prepareRow(row);
            return (
              <tr
                {...row.getRowProps()}
                style={{ backgroundColor: row.index % 2 === 0 ? '#f5f5f5' : 'transparent' }}
              >
                {row.cells.map((cell) => (
                  <td {...cell.getCellProps()} style={{ padding: '18px' }}>
                    {cell.render('Cell')}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
      <div className='btns'>
        <button type='button' className='btnSave' onClick={saveData}>
          Save
        </button>
        <button type='button' className='btnReset' onClick={resetData}>
          Reset
        </button>
      </div>
    </>
  );
};

export default ReactTable;
