## Before running tests

> Before running the tests make sure you comment out the portion of the code that starts server .

##### Code portion

```typescript
app.listen(PORT, () => {
	console.log(`Server starting at : localhost: ${PORT}`);
});
```

---

> Don't forget to export the application with 

##### Code portion
```typescript
 export default app
``` 
>at the end of the main file.// import { Request } from 'express';
