import { Sequelize, Op } from "sequelize";
import Contact from "../../models/Contact";
import User from "../../models/User";
import Ticket from "../../models/Ticket";
import UsersQueues from "../../models/UsersQueues";
import { logger } from "../../utils/logger";

interface Request {
  searchParam?: string;
  pageNumber?: string;
  tenantId: string | number;
  profile: string;
  userId: string | number;
}

interface Response {
  contacts: Contact[];
  count: number;
  hasMore: boolean;
}

const ListContactsService = async ({
  searchParam = "",
  pageNumber = "1",
  tenantId,
  profile,
  userId
}: Request): Promise<Response> => {
  const whereCondition = {
    tenantId,
    [Op.or]: [
      {
        name: Sequelize.where(
          Sequelize.fn("LOWER", Sequelize.col("Contact.name")),
          "LIKE",
          `%${searchParam.toLowerCase().trim()}%`
        )
      },
      { number: { [Op.like]: `%${searchParam.toLowerCase().trim()}%` } }
    ]
  };
  const limit = 40;
  const offset = limit * (+pageNumber - 1);

  /*const { count, rows: contacts } = await Contact.findAndCountAll({
    where: whereCondition,
    limit,
    offset,
    order: [["name", "ASC"]],  
    include: [
      { 
        model: User,
        required: false
      }
    ]
    // subQuery: true
  });*/
  let whereTicket = {};
  logger.info("Pesquisando contatos para o perfil " + profile);
  if (profile !== "admin"){
    const QueuesWhere =  await UsersQueues.findAll({where:{userId: userId}})
    var concatQueues : number[] = [];
    await QueuesWhere.forEach(function(queueNow){
      let queueId = queueNow.queueId;
      concatQueues = [...concatQueues, queueId];
    });
    whereTicket = { queueId: concatQueues};
  }

  const { count, rows: contacts } = await Contact.findAndCountAll({
    where: whereCondition,
    limit,
    offset,
    order: [["name", "ASC"]],  
    include: [
      { 
        model: Ticket,
        required: true,
        where: whereTicket,
        include: [
          { 
            model: User,
            required: false
          }
        ]
      }
    ]
    // subQuery: true
  });




  const hasMore = count > offset + contacts.length;

  return {
    contacts,
    count,
    hasMore
  };
};

export default ListContactsService;
