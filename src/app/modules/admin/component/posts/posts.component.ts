import { Component, ViewChild, AfterViewInit, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { DataTableDirective } from 'angular-datatables';
import { Post } from 'src/app/modules/shared/models/post';
import { PostService } from 'src/app/modules/shared/services/post.service';

@Component({
  selector: 'app-posts',
  templateUrl: './posts.component.html',
  styleUrls: ['./posts.component.scss']
})
export class PostsComponent implements AfterViewInit, OnDestroy {
  options: DataTables.Settings = {
    pagingType: 'full_numbers',
    pageLength: 10,
    serverSide: true,
    processing: true,
    ajax: (dataTablesParameters: any, callback) => {
      this.postService.getFilteredEntities(dataTablesParameters).subscribe(response => {
        this.posts = response.data;
        callback({ ...response, data: [] });
        this.adjustColumns();
      });
    },
    columns: [{ data: 'name' }, { data: null, orderable: false }],
    language: { url: '//cdn.datatables.net/plug-ins/1.10.19/i18n/Ukrainian.json' },
    scrollX: true
  };

  posts: Post[] = [];
  selectedPost: Post;
  renderTrigger: Subject<any> = new Subject();
  @ViewChild(DataTableDirective) datatableElement: DataTableDirective;

  constructor(private postService: PostService) {}

  ngAfterViewInit(): void {
    this.renderTrigger.next();
  }

  ngOnDestroy(): void {
    this.renderTrigger.unsubscribe();
  }

  reloadTable(): void {
    this.datatableElement.dtInstance.then((dtInstance: DataTables.Api) => {
      dtInstance.destroy();
      this.renderTrigger.next();
    });
  }

  selectPost(post: Post) {
    this.selectedPost = { ...post };
  }

  private adjustColumns() {
    setTimeout(() => $(window).trigger('resize'), 0);
  }
}
