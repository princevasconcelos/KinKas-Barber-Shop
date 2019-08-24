import Bee from 'bee-queue';

import CancelationMail from '../jobs/CancelationMail';
import redisConfig from '../../config/redis';

const jobs = [CancelationMail];

class Queue {
  constructor() {
    this.queues = {};
    this.init();
  }

  /**
   * pegamos todos os jobs da aplicação e armazena dentro do
   * queues;
   * ele possuia uma fila e o handle que processa
   */

  init() {
    jobs.forEach(({ key, handle }) => {
      this.queues[key] = {
        bee: new Bee(key, {
          redis: redisConfig,
        }),
        handle,
      };
    });
  }

  add(queue, job) {
    return this.queues[queue].bee.createJob(job).save();
  }

  processQueue() {
    jobs.forEach(job => {
      const { bee, handle } = this.queues[job.key];

      bee.on('failed', this.handleFailed).process(handle);
    });
  }

  handleFailed(job, err) {
    console.log(`QUEUE ${job.queue.name} FAILED`, err);
  }
}

export default new Queue();
