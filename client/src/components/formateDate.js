export const formatDate = (dateString) => {
    const date = new Date(dateString);
  
    const options = { day: '2-digit', month: 'long', year: 'numeric' };
    return date.toLocaleDateString('en-US', options);
  };