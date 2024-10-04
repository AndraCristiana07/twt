import { Outlet } from "react-router-dom";
import { Container, Row, Col } from "react-bootstrap";
import Menu from './drawer';

 const Layout = ({}) => {
    return (
        <Container fluid style={{ position: "relative" }}>
        <Row>
            <Col xs={3} style={{ position: "fixed", height: "100vh", overflow: "auto", borderRight: "1px solid black" }}>
                <Menu  />
            </Col>
            <Col xs={{ span: 6, offset: 3 }}>
                <Outlet />
            </Col>
            <Col xs={{ span: 3, offset: 9 }}
                style={{ position: "fixed", height: "100vh", overflow: "auto", borderLeft: "1px solid black" }}>

            </Col>
        </Row>
    </Container>
    )
}
export default Layout