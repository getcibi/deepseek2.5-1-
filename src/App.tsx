// ... (previous imports and code)

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!input.trim()) return;

  const newMessage = { role: 'user', content: input };
  setMessages((prev) => [...prev, newMessage]);
  setInput('');
  setIsLoading(true);

  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: [{ role: "user", content: input }],
        stream: true,
      }),
    });

    if (!response.ok) throw new Error('Network response was not ok');

    const reader = response.body?.getReader();
    if (!reader) throw new Error('Reader not available');

    const decoder = new TextDecoder();
    let assistantMessage = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      
      const chunk = decoder.decode(value, { stream: true });
      const lines = chunk.split('\n');
      
      for (const line of lines) {
        if (line.startsWith('data: ')) {
          try {
            const data = JSON.parse(line.slice(5));
            if (data.choices && data.choices[0].delta.content) {
              assistantMessage += data.choices[0].delta.content;
              setMessages((prev) => [
                ...prev.slice(0, -1),
                { role: 'assistant', content: assistantMessage },
              ]);
            }
          } catch (error) {
            console.warn('Error parsing JSON:', line, error);
          }
        }
      }
    }

  } catch (error) {
    console.error('Error:', error);
    setMessages((prev) => [
      ...prev,
      { role: 'assistant', content: 'Sorry, an error occurred. Please try again.' },
    ]);
  } finally {
    setIsLoading(false);
  }
};

// ... (rest of the component remains the same)