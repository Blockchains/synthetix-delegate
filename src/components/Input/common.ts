import styled from 'styled-components';

export const Input = styled.input`
	width: 100%;
	font-family: ${props => props.theme.fonts.regular};
	background-color: ${props => props.theme.colors.surfaceL3};
	border: 1px solid ${props => props.theme.colors.accentL2};
	height: 42px;
	padding: 0 10px;
	font-size: 14px;
	color: ${props => props.theme.colors.fontPrimary};
	::placeholder {
		opacity: 0.5;
		color: ${props => props.theme.colors.fontTertiary};
	}
`;
