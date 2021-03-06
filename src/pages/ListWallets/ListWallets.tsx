import React, { memo, FC, useEffect, useState } from 'react';
import { connect } from 'react-redux';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';

import { REQUEST_REFRESH_INTERVAL_MS } from 'constants/request';
import { WalletAddress } from 'constants/wallet';
import { buildManageWalletLink } from 'constants/routes';

import { RootState } from 'store/types';
import { getDelegateWalletsState } from 'store/ducks/delegates/delegateWallets';
import { fetchDelegateWalletInfoRequest } from 'store/ducks/delegates/delegateWalletInfo';
import {
	DelegatesSliceState,
	fetchDelegateWalletsRequest,
} from 'store/ducks/delegates/delegateWallets';

import history from 'utils/history';
import { toShortWalletAddr } from 'utils/formatters/wallet';

import useInterval from 'hooks/useInterval';

import Link from 'components/Link';
import LINKS from 'constants/links';
import Button from 'components/Button';
import TextInput from 'components/Input/TextInput';
import Spinner from 'components/Spinner';

import { Message, PageHeadline, PageLogo } from 'styles/common';

interface DispatchProps {
	fetchDelegateWalletsRequest: typeof fetchDelegateWalletsRequest;
	fetchDelegateWalletInfoRequest: typeof fetchDelegateWalletInfoRequest;
}

interface StateProps {
	delegatesRequestState: DelegatesSliceState;
}

type ListWalletsProps = DispatchProps & StateProps;

export const ListWallets: FC<ListWalletsProps> = memo(
	({ fetchDelegateWalletsRequest, fetchDelegateWalletInfoRequest, delegatesRequestState }) => {
		const [walletAddr, setWalletAddr] = useState<WalletAddress>('');
		const [walletAddrErr, setWalletAddrErr] = useState<boolean>(false);
		const { t } = useTranslation();

		const delegateWallets = delegatesRequestState.data;

		useEffect(() => {
			fetchDelegateWalletsRequest();
			// eslint-disable-next-line react-hooks/exhaustive-deps
		}, []);

		useInterval(() => {
			fetchDelegateWalletsRequest();
		}, REQUEST_REFRESH_INTERVAL_MS);

		// preload wallets
		useEffect(() => {
			fetchDelegateWalletInfoRequest({ walletAddresses: delegateWallets });
		}, [delegateWallets, fetchDelegateWalletInfoRequest]);

		const handleWalletAddrOnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
			setWalletAddr(e.target.value);
			setWalletAddrErr(false);
		};

		const handleManualWalletAddr = () => {
			setWalletAddrErr(false);
			if (delegateWallets.includes(walletAddr)) {
				history.push(buildManageWalletLink(walletAddr));
			} else {
				setWalletAddrErr(true);
			}
		};

		return (
			<>
				<PageLogo />
				<PageHeadline>{t('list-wallets.headline')}</PageHeadline>
				<Wallets>
					{delegatesRequestState.isLoaded ? (
						delegateWallets.length === 0 ? (
							t('list-wallets.no-results')
						) : (
							<>
								{delegateWallets.map(wallet => (
									<PrimaryLink to={buildManageWalletLink(wallet)} key={wallet}>
										{toShortWalletAddr(wallet)}
									</PrimaryLink>
								))}
								<ManualWalletAddr>
									<div>{t('list-wallets.custom-addr.label')}</div>
									<ManualWalletAddrInput>
										<TextInput
											onChange={handleWalletAddrOnChange}
											placeholder={t('list-wallets.custom-addr.placeholder')}
										/>
										{walletAddrErr && (
											<ErrorMessage floating={true} type="error">
												{t('list-wallets.custom-addr.error-message')}
											</ErrorMessage>
										)}
									</ManualWalletAddrInput>
									<Button
										palette="primary"
										onClick={handleManualWalletAddr}
										disabled={walletAddr.length === 0}
									>
										{t('common.actions.submit')}
									</Button>
								</ManualWalletAddr>
							</>
						)
					) : (
						delegatesRequestState.isLoading && <Spinner />
					)}
				</Wallets>
				<SecondaryLink to={LINKS.BLOG_POST} isExternal={true}>
					{t('list-wallets.read-blog')}
				</SecondaryLink>
			</>
		);
	}
);

const Wallets = styled.div`
	flex-grow: 1;
	color: ${props => props.theme.colors.fontPrimary};
`;

const PrimaryLink = styled(Link)`
	font-weight: 500;
	font-size: 24px;
	letter-spacing: 0.2px;
	margin-bottom: 24px;
	font-family: ${props => props.theme.fonts.regular};
	color: ${props => props.theme.colors.fontPrimary};
	background-color: ${props => props.theme.colors.accentL1};
	display: flex;
	align-items: center;
	justify-content: center;
	height: 64px;
	box-sizing: border-box;
`;

const SecondaryLink = styled(PrimaryLink)`
	flex-shrink: 0;
	font-size: 20px;
	color: ${props => props.theme.colors.fontSecondary};
`;

const ManualWalletAddr = styled.div`
	display: grid;
	grid-gap: 16px;
`;

const ManualWalletAddrInput = styled.div`
	position: relative;
`;

const ErrorMessage = styled(Message)`
	margin-top: 5px;
`;

const mapStateToProps = (state: RootState): StateProps => ({
	delegatesRequestState: getDelegateWalletsState(state),
});

const mapDispatchToProps: DispatchProps = {
	fetchDelegateWalletsRequest,
	fetchDelegateWalletInfoRequest,
};

export default connect(mapStateToProps, mapDispatchToProps)(ListWallets);
