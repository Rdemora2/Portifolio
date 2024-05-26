import React, { useContext } from 'react';
import Switch from 'react-switch';
import { ThemeContext } from 'styled-components';
import { Link } from 'react-router-dom';
import { ContainerAbout, Image, SubContainerAbout, SubTitle, Description, ContainerButtons, ContactButton, TextButton } from './styles';

import photo from '../../assets/photo.png';

import { FiArrowRight } from "react-icons/fi";
interface Props {
    toggleTheme(): void;
}

const About: React.FC<Props> = ({ toggleTheme }) => {
    const { colors, title } = useContext(ThemeContext);

    return (
        <ContainerAbout id="sobre">
            <Image src={photo} alt="Roberto Moraes" />

            <SubContainerAbout>
                <SubTitle>
                    Sobre mim
                </SubTitle>

                <Description>
                    Comecei minha jornada na programação em 2021, de lá pra explorei diversas linguagens/frameworks e descobri que sou um apaixonado por tecnologia e, principalmente, resolver problemas por meio da tecnologia.
                </Description>
                <Description>
                    Atualmente atuo com <strong>desenvolvimento web/mobile full stack</strong>, possuindo experiência abrangente em JavaScript, TypeScript, Node.js, React, React Native, Vue.js, Python, Django, Django Rest Framework, PostgreSQL, AWS e Google Cloud para criar aplicações de alto nível e valor.
                </Description>
                <Description>
                    Meu foco é aprender novas coisas e aprimorar ainda mais as habilidades que possuo, gosto sempre de estar em constante aprendizado e evoluindo dia após dia, e como consequência, sempre agregando valor aos projetos que participo.</Description>
                <ContainerButtons>
                    <ContactButton href="#contato">
                        <TextButton>
                            Contato
                        </TextButton>
                    </ContactButton>
                </ContainerButtons>
            </SubContainerAbout>
        </ContainerAbout>
    );
}

export default About;