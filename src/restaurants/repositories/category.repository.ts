import { EntityRepository, Repository } from 'typeorm';
import { Category } from '../entities/category.entity';

@EntityRepository(Category)
export class CategoryRepository extends Repository<Category> {
  async getOrCreate(name: string): Promise<Category> {
    // trim 을 사용해서 문자 앞 뒤의 띄어쓰기 제거
    // toLowerCase 을 사용해서 모든 문자 소문자로 변경
    const categoryName = name.trim().toLowerCase();

    // 정규 표현식을 사용해서 띄어쓰기 부분을 - 으로 대체한다.
    const categorySlug = categoryName.replace(/ /g, '-');

    let category = await this.findOne({
      slug: categorySlug,
    });

    if (!category) {
      category = await this.save(
        this.create({
          slug: categorySlug,
          name: categoryName,
          coverImage: 'https://',
        }),
      );
    }
    return category;
  }
}
