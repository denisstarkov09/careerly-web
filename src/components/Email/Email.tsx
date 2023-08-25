import React from 'react';
import {
    Body,
    Button,
    Container,
    Head,
    Heading,
    Hr,
    Html,
    Link,
    Preview,
    Section,
    Tailwind,
    Text,
} from '@react-email/components';

interface InviteUserEmailProps {
    username?: string;
    invitedByUsername?: string;
    invitedByEmail?: string;
    inviteLink?: string;
    nameOfPersonOnTimeline?: string;
}

export const Email = ({
    username,
    invitedByUsername,
    invitedByEmail,
    inviteLink,
    nameOfPersonOnTimeline
}: InviteUserEmailProps) => {
    const previewText = `Review ${invitedByUsername} on Careerly`;
    return (
        <Html>
            <Head />
            <Preview>{previewText}</Preview>
            <Tailwind>
                <Body className="bg-white my-auto mx-auto font-sans">
                    <Container className="border border-solid border-[#eaeaea] rounded my-[40px] mx-auto p-[20px] w-[465px]">
                        {/* <Section className="mt-[32px]">
                            <Img
                                src="https://postimg.cc/N2kGnQMx"
                                width="120"
                                height="40"
                                alt="Careely"
                                className="my-0 mx-auto"
                            />
                        </Section> */}
                        <Heading className="text-black text-[24px] font-normal text-center p-0 my-[30px] mx-0">
                            Accept <strong>Timeline Invite</strong> on <strong>Careerly</strong>
                        </Heading>
                        <Text className="text-black text-[14px] leading-[24px] px-[20px]">
                            Hello {username},
                        </Text>
                        <Text className="text-black text-[14px] leading-[24px] px-[20px]">
                            <strong>{invitedByUsername}</strong> (
                            <Link
                                href={`mailto:${invitedByEmail}`}
                                className="text-blue-600 no-underline"
                            >
                                {invitedByEmail}
                            </Link>
                            ) has invited you to review a timeline they created on <strong>Careerly</strong> 
                             for <strong>{nameOfPersonOnTimeline}</strong>.
                            Accept below to see how <strong>{nameOfPersonOnTimeline}</strong> has progressed over time. 
                        </Text>
                        <Section>
                            {/* <Row>
                                <Column align="right">
                                    <Img className="rounded-full" src={User} width="64" height="64" />
                                </Column>
                                <Column align="center">
                                    <Img
                                        src={Arrow}
                                        width="12"
                                        height="9"
                                        alt="invited you to"
                                    />
                                </Column>
                                <Column align="left">
                                    <Img className="rounded-full" src={Entry} width="64" height="64" />
                                </Column>
                            </Row> */}
                        </Section>
                        <Section className="text-center mt-[32px] mb-[32px]">
                            <Button
                                pX={20}
                                pY={12}
                                className="bg-[#000000] rounded text-white text-[12px] font-semibold no-underline text-center"
                                href={inviteLink}
                            >
                                Accept Invite
                            </Button>
                        </Section>
                        <Text className="text-black text-[14px] leading-[24px] px-[20px]">
                            or copy and paste this URL into your browser:{' '}
                            <Link
                                href={inviteLink}
                                className="text-blue-600 no-underline"
                            >
                                {inviteLink}
                            </Link>
                        </Text>
                        <Hr className="border border-solid border-[#eaeaea] my-[26px]" style={{ width: '425px', marginLeft: '20px' }} />
                        <Text className="text-[#666666] text-[12px] leading-[24px] px-[20px]">
                            This invitation was intended for{' '}
                            <span className="text-black">{username} </span>. If you were not
                            expecting this invitation, you can ignore this email. If you are
                            concerned about your account's safety, please reply to this email to
                            get in touch with us.
                        </Text>
                    </Container>
                </Body>
            </Tailwind>
        </Html>
    );
};

export default Email;