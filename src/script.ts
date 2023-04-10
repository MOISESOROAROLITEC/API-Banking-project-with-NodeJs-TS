import express, { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import bodyParser, { BodyParser } from 'body-parser';
import { userRoutes } from './route/user';

dotenv.config();

const app = express();
app.use(express.json());
const PORT = process.env.PORT;

const prisma = new PrismaClient();

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

app.use("/", userRoutes)

app.get('/users', async (req: Request, res: Response) => {
	const users = await prisma.user.findFirst()
	return res.json(users);
});


app.post('/users', async (req: Request, res: Response) => {
	const user = await prisma.user.create({
		data: {
			name: req.body.name,
			email: req.body.email,
			password: req.body.password
		},
	});
	res.json(user);
});

app.put('/users/:id', async (req: Request, res: Response) => {
	const user = await prisma.user.update({
		where: { id: parseInt(req.params.id) },
		data: {
			name: req.body.name,
			email: req.body.email,
		},
	});
	res.json(user);
});

app.delete('/users/:id', async (req: Request, res: Response) => {
	const user = await prisma.user.delete({
		where: { id: parseInt(req.params.id) },
	});
	res.json(user);
});

app.listen(PORT, () => {
	console.log(`Serveur démarré sur le port ${PORT}`);
});

