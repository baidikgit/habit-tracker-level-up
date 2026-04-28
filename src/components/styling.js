export const GLOBAL_CSS = `
  
  @import url('https://fonts.googleapis.com/css2?family=Iceberg&family=Montserrat:ital,wght@0,100..900;1,100..900&family=Oswald:wght@200..700&display=swap');
  *, *::before, *::after {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  body {
    background:  #111111;
    color:       #e0e0e0;
    font-family: "Iceberg", sans-serif;
    font-weight: 400;
    font-style: normal;
    min-height:  100vh;
  }

  button {
    cursor:      pointer;
    font-family: inherit;
    color:       inherit;
    border:      none;
    background:  none;
  }

  input, select {
    font-family: inherit;
    color:       inherit;
  }
  ::-webkit-scrollbar { width: 4px; }
  ::-webkit-scrollbar-track { background: #1a1a1a; }
  ::-webkit-scrollbar-thumb { background: #333; border-radius: 2px; }
`;
