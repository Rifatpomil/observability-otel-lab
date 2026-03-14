import { useState } from 'react';
import styled, { keyframes } from 'styled-components';
import { useAiAssistant } from '../../providers/ProductAIAssistant.provider';
import Image from 'next/image';

const slideIn = keyframes`
  from { transform: translateX(100%); }
  to { transform: translateX(0); }
`;

const DrawerContainer = styled.div<{ $isOpen: boolean }>`
  position: fixed;
  top: 0;
  right: 0;
  width: 400px;
  height: 100vh;
  background: rgba(15, 15, 25, 0.85);
  backdrop-filter: blur(20px);
  border-left: 1px solid rgba(255, 255, 255, 0.1);
  z-index: 2000;
  display: flex;
  flex-direction: column;
  box-shadow: -10px 0 30px rgba(0, 0, 0, 0.5);
  transform: ${props => props.$isOpen ? 'translateX(0)' : 'translateX(100%)'};
  transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1);
  visibility: ${props => props.$isOpen ? 'visible' : 'hidden'};
`;

const Header = styled.div`
  padding: 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const Title = styled.h2`
  margin: 0;
  font-size: 18px;
  color: white;
  display: flex;
  align-items: center;
  gap: 10px;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: white;
  cursor: pointer;
  opacity: 0.6;
  &:hover { opacity: 1; }
`;

const ChatBody = styled.div`
  flex: 1;
  padding: 20px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 15px;
`;

const Message = styled.div<{ $isUser?: boolean }>`
  max-width: 85%;
  padding: 12px 16px;
  border-radius: 12px;
  font-size: 14px;
  line-height: 1.5;
  align-self: ${props => props.$isUser ? 'flex-end' : 'flex-start'};
  background: ${props => props.$isUser ? '#3b82f6' : 'rgba(255, 255, 255, 0.05)'};
  color: ${props => props.$isUser ? 'white' : 'rgba(255, 255, 255, 0.9)'};
  border: ${props => props.$isUser ? 'none' : '1px solid rgba(255, 255, 255, 0.1)'};
`;

const InputArea = styled.form`
  padding: 20px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  gap: 10px;
`;

const Input = styled.input`
  flex: 1;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  padding: 10px 15px;
  color: white;
  outline: none;
  &:focus { border-color: #3b82f6; }
`;

const SendButton = styled.button`
  background: #3b82f6;
  border: none;
  border-radius: 8px;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  &:disabled { opacity: 0.5; cursor: not-allowed; }
`;

const FloatButton = styled.button`
  position: fixed;
  bottom: 30px;
  right: 30px;
  width: 60px;
  height: 60px;
  border-radius: 30px;
  background: #3b82f6;
  color: white;
  border: none;
  box-shadow: 0 5px 20px rgba(59, 130, 246, 0.4);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  transition: transform 0.2s;
  &:hover { transform: scale(1.1); }
`;

const AIChatDrawer = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<any[]>([]);
  const { sendAiRequest, aiLoading } = useAiAssistant();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || aiLoading) return;

    const userMsg = { text: input, isUser: true };
    setMessages(prev => [...prev, userMsg]);
    
    sendAiRequest({ question: input }, {
      onSuccess: (data: any) => {
        const botMsg = { text: typeof data === 'string' ? data : data.text, isUser: false };
        setMessages(prev => [...prev, botMsg]);
      }
    });
    
    setInput('');
  };

  return (
    <>
      <FloatButton onClick={() => setIsOpen(true)}>
        <Image src="/icons/Chat.svg" width={24} height={24} alt="ai assistant" />
      </FloatButton>

      <DrawerContainer $isOpen={isOpen}>
        <Header>
          <Title>
            <Image src="/icons/Star.svg" width={20} height={20} alt="ai" />
            Astronomy Assistant
          </Title>
          <CloseButton onClick={() => setIsOpen(false)}>✕</CloseButton>
        </Header>
        <ChatBody>
          {messages.length === 0 && (
            <Message>Hello! I'm your AI assistant for any questions about our astronomy products. How can I help you today?</Message>
          )}
          {messages.map((m, i) => (
            <Message key={i} $isUser={m.isUser}>{m.text}</Message>
          ))}
          {aiLoading && <Message>Thinking...</Message>}
        </ChatBody>
        <InputArea onSubmit={handleSubmit}>
          <Input 
            placeholder="Ask anything about this product..." 
            value={input}
            onChange={e => setInput(e.target.value)}
          />
          <SendButton type="submit" disabled={aiLoading}>
            ➤
          </SendButton>
        </InputArea>
      </DrawerContainer>
    </>
  );
};

export default AIChatDrawer;
