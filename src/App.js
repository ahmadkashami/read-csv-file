import './App.css';
import Papa from "papaparse";
import {useEffect, useState} from "react"
import {CSVLink} from "react-csv";
import 'bootstrap/dist/css/bootstrap.min.css';
import Button from 'react-bootstrap/Button';
import {Col, Container, Row} from "react-bootstrap";


function App() {
    const [fileName, setFileName] = useState("")
    const [data, setData] = useState([])
    const [data1, setData1] = useState([])
    const [data2, setData2] = useState([])
    const handeInputFile = (e) => {
        const files = e.target.files;
        if (files) {
            setFileName(files[0])
            Papa.parse(files[0], {
                    complete: function (results) {
                        setData(results.data)
                    }
                }
            )
        }
    }

    const getTotalQty = (data) => {
        const total = data.reduce((accumulator, object) => {
            return accumulator + Number(object.quantity);
        }, 0);
        return total
    }

    const groupProductByName = (data) => {
        return data.reduce((group, product) => {
            const {name} = product;
            group[name] = group[name] ?? [];
            group[name].push(product);
            return group;
        }, {});
    }
    const groupByBrand = (data) => {
        return data.reduce((group, product) => {
            const {brand} = product;
            group[brand] = group[brand] ?? [];
            group[brand].push(product);
            return group;
        }, {});
    }

    useEffect(() => {
        if (data.length > 0) {
            const products = [];
            const fileLength = data.length
            data.forEach((item) => {
                products.push({id: item[0], area: item[1], name: item[2], quantity: item[3], brand: item[4]})
            })
            const groupByName = groupProductByName(products)
            const dataForFileBuffer = []
            const dataForFileBuffer2 = []

            const dataForFileBufferGroupByBrand = []
            const dataForFileBufferGroupByBrandLength = []
            for (const key in groupByName) {
                dataForFileBuffer.push([key, getTotalQty(groupByName[key]) / fileLength])
                dataForFileBufferGroupByBrand.push({name: key, brands: groupByBrand(groupByName[key])})
            }
            setData1(dataForFileBuffer)
            dataForFileBufferGroupByBrand.map((item) => {
                for (const key in item.brands) {
                    dataForFileBufferGroupByBrandLength.push({
                        brand: key,
                        name: item.brands[key][0].name,
                        count: item.brands[key].length
                    })
                }
            })
            const keys = Object.keys(groupByName);
            for (const key in keys) {
                const results = dataForFileBufferGroupByBrandLength.filter(obj => {
                    return obj.name === keys[key];
                });
                const brandWithMostOrder = results.reduce((prev, current) => {
                    return prev.count > current.count ? prev : current;
                });
                
               const moreData = results.filter(a => a.count == brandWithMostOrder.count)
                moreData.map((item) => {
                    dataForFileBuffer2.push([keys[key], item.brand])
                })
            }
            setData2(dataForFileBuffer2)
        }

    }, [data]);
    return (
        <div className="App">
            <header className="App-header">
                <Container>
                    <Row>
                        <Col>
                            <input
                                type="file"
                                accept=".csv"
                                onChange={handeInputFile}
                            />
                        </Col>
                    </Row>

                    {
                        data.length > 0 ? <Row className="m-5">
                            {
                                (data1.length > 0 && data2.length > 0) ? <>
                                    <Col lg="5">
                                        <CSVLink className="btn btn-primary" data={data1}
                                                 filename={"0_" + fileName.name + ".csv"}>Download {" 0_" + fileName.name + ".csv"}</CSVLink>
                                    </Col>
                                    <Col lg="5">
                                        <CSVLink className="btn btn-primary" data={data2}
                                                 filename={"1_" + fileName.name + ".csv"}>Download{" 1_" + fileName.name + ".csv"}</CSVLink>
                                    </Col>
                                </> : <h2>The data is being processed</h2>
                            }
                        </Row> : null
                    }

                </Container>
            </header>
        </div>
    );
}

export default App;
