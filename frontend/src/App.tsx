import { Alert, Button, Card, CardBody, CardTitle, Col, Form, Input, InputGroup, Label, Progress, Row } from 'reactstrap';
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { permutations } from 'itertools';


async function testPassword(difficulty: number, password: string) {
    let result = null;
    while(!result) {
        result = axios.post(
            'http://localhost:8082/check_pass',
            {'difficulty': difficulty, 'password': password},
        )
        .then((response) => {
            return response.data;
        })
        .catch((error) => {
            console.log(error);
            return null;
        })
    }
    return result;
}


function countPermutations(iterable: Iterable<any>) {
    let count = 0;
    for (const _ of iterable) {
        count++;
    }
    return count;
}


function App() {
    const [
        difficulty,
        setDifficulty,
    ] = useState<number>(0);

    const [
        password,
        setPassword,
    ] = useState<string>('');

    const [
        isError,
        setIsError,
    ] = useState<boolean>(false);

    const [
        messaage,
        setMessage,
    ] = useState<string | null>(null);

    const [
        crackedPass,
        setCrackedPass,
    ] = useState<string | null>(null);

    const [
        crackingProgress,
        setCrackingProgress,
    ] = useState<number>(0);

    const [
        checked,
        setChecked,
    ] = useState<number>(0);

    const permCount = useRef<number>(0);

    const submitPass = () => {
        testPassword(difficulty, password).then((data) => {
            if(data['result'] === true) {
                setIsError(false);
                setMessage('Correct password');
            } else {
                setIsError(true);
                setMessage('Incorrect password');
            }
        });
    };

    const crackPass = () => {
        let alphabet = '';
        let permutationsLen = 0;
        switch(difficulty) {
            case 0:
                alphabet = '0123456789';
                permutationsLen = 4;
                break;
            case 1:
                alphabet = '0123456789';
                permutationsLen = 5;
                break;
            case 2:
                alphabet = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
                permutationsLen = 4;
                break;
            case 3:
                alphabet = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
                permutationsLen = 4;
                break;
            case 4:
                alphabet = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+-=';
                permutationsLen = 4;
                break;
        }
        let perms = permutations(alphabet, permutationsLen);
        permCount.current = countPermutations(perms);
        perms = permutations(alphabet, permutationsLen);
        for(let perm of perms) {
            testPassword(difficulty, perm.join('')).then((data) => {
                setChecked(prevState => prevState + 1);
                if(data['result'] === true) {
                    setCrackedPass(perm.join(''));
                    setTimeout(() => {
                        setCrackingProgress(0);
                        permCount.current = 0;
                        setChecked(0);
                    }, 5000);
                }
            });
        }
    };

    useEffect(() => {
        setCrackingProgress(checked / permCount.current * 100);
    }, [checked]);

    return (
        <div className='w-100 p-3 d-fexjustify-content-center align-items-center'>
            <Card
                className='w-100 mb-2'
            >
            <CardBody>
                <CardTitle tag="h5">
                    Manual pass testing
                </CardTitle>
            </CardBody>
            <CardBody>
                <Form>
                <InputGroup>
                <Label for="difficulty">Password difficulty</Label>
                    <Input
                    id="difficulty"
                    name="difficulty"
                    type="select"
                    placeholder='difficulty'
                    value={difficulty}
                    onChange={(e) => {setDifficulty(Number(e.target.value))}}
                    className='w-100'
                    >
                    <option value={0}>
                        Easy
                    </option>
                    <option value={1}>
                        Medium
                    </option>
                    <option value={2}>
                        HARD
                    </option>
                    <option value={3}>
                        VERY HARD
                    </option>
                    <option value={4}>
                        IMPOSSIBLE
                    </option>
                    </Input>
                </InputGroup>
                <InputGroup>
                    <Label for="password">Password</Label>
                    <Input
                        type="text"
                        placeholder='password'
                        name='password'
                        value={password}
                        onChange={(e) => {setPassword(e.target.value)}}
                        className='w-100'
                    />
                </InputGroup>
                <Row className='w-100'>
                    <Col sm={1}>
                        <Button className='mt-3' style={{minHeight: '58px'}} color='primary' onClick={submitPass}>Submit</Button>
                    </Col>
                    <Col>
                        {messaage !== null && <Alert className='mt-3 w-100' color={isError ? 'danger' : 'success'}>{messaage}</Alert>}
                    </Col>
                </Row>
                </Form>
            </CardBody>
            </Card>

            <Card
                className='w-100'
            >
            <CardBody>
                <CardTitle tag="h5">
                Password cracker
                </CardTitle>
            </CardBody>
            <CardBody>
                <Form>
                <InputGroup>
                <Label for="difficulty">Password difficulty</Label>
                    <Input
                    id="difficulty"
                    name="difficulty"
                    type="select"
                    placeholder='difficulty'
                    value={difficulty}
                    onChange={(e) => {setDifficulty(Number(e.target.value))}}
                    className='w-100'
                    >
                        <option value={0}>
                            Easy
                        </option>
                        <option value={1}>
                            Medium
                        </option>
                        <option value={2}>
                            HARD
                        </option>
                        <option value={3}>
                            VERY HARD
                        </option>
                        <option value={4}>
                            IMPOSSIBLE
                        </option>
                    </Input>
                </InputGroup>
                <Progress className='mt-3' animated value={crackingProgress} max={100} />
                <Row className='w-100'>
                    <Col sm={2}>
                        <Button className='mt-3' style={{minHeight: '58px'}} color='primary' onClick={crackPass}>Crack Password</Button>
                    </Col>
                    <Col>
                        {crackedPass !== null && <Alert className='mt-3 w-100' color='success'>{`Pass: ${crackedPass}`}</Alert>}
                    </Col>
                </Row>
                </Form>
            </CardBody>
            </Card>
        </div>
    );
}

export default App;
