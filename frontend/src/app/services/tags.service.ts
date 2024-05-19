import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable, catchError, tap, throwError } from "rxjs";
import { Tag } from "src/app/models/models";
import { environment } from "src/environments/environment";
import { LocalStorageService } from "./local-storage.service";

@Injectable({
    providedIn: "root",
})
export class TagsService {
    url: string;
    availableTags: string[] = [];


    private availableTagsSubject: BehaviorSubject<string[]> = new BehaviorSubject<string[]>([]);
    availableTags$: Observable<string[]> = this.availableTagsSubject.asObservable();

    private availableTagsSubjectSearch: BehaviorSubject<string[]> = new BehaviorSubject<string[]>([]);
    availableTagsSearch$: Observable<string[]> = this.availableTagsSubject.asObservable();

    private selectedTagsSubject: BehaviorSubject<string[]> = new BehaviorSubject<string[]>([]);
    selectedTags$: Observable<string[]> = this.selectedTagsSubject.asObservable();

    constructor(
        private http: HttpClient,
        private localStorageService: LocalStorageService
    ) {
        this.url = environment.backendUrl || "http://localhost:3000";
        this.loadAvailableTags();
        this.loadAvailableTagsSearch();
    }

    private loadAvailableTags(): void {
        this.http.get(this.url + "/tags/all", { withCredentials: true })
            .pipe(
                tap((tags) => {
                    this.availableTagsSubject.next(tags as string[]);
                }),
                catchError(error => {
                    return [];
                })
            )
            .subscribe();
    }

    private loadAvailableTagsSearch(): void {
        this.http.get(this.url + "/tags/allsearch", { withCredentials: true })
            .pipe(
                tap((tags) => {
                    this.availableTagsSubjectSearch.next(tags as string[]);
                }),
                catchError(error => {
                    return [];
                })
            )
            .subscribe();
    }

    public getTags(): Observable<string[]> {
        return this.availableTagsSubject.asObservable();
    }

    public getTagsSearch(): Observable<string[]> {
        return this.availableTagsSubjectSearch.asObservable();
    }

    public getSelectedTags() {
        this.http.get<Tag[]>(this.url + "/tags/user/" + this.localStorageService.getItem("id"), { withCredentials: true }).subscribe((tags) => {
            this.selectedTagsSubject.next((tags as Tag[]).map(t => t.name));
            this.availableTagsSubject.next(this.availableTagsSubject.value.filter(t => !this.selectedTagsSubject.value.includes(t)));
        });
    }


    addTag(tag: string) {
        const selectedTags = [...this.selectedTagsSubject.value];
        if (selectedTags.includes(tag)) {
            return;
        }
        const index = this.availableTags.indexOf(tag);
        if (index !== -1) {
            this.availableTags.splice(index, 1);
        }
        selectedTags.push(tag);
        this.selectedTagsSubject.next(selectedTags);
        this.availableTagsSubject.next(this.availableTagsSubject.value.filter(t => t !== tag));
    }

    removeTag(tag: string) {
        const index = this.selectedTagsSubject.value.indexOf(tag);
        const selectedTags = this.selectedTagsSubject.value;
        selectedTags.splice(index, 1);

        this.selectedTagsSubject.next(selectedTags);
        this.availableTags.push(tag);
        this.availableTagsSubject.next([...this.availableTagsSubject.value, tag]);

    }
}